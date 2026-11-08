<?php

namespace App\Services;

use App\Models\SellingPost;
use Carbon\CarbonImmutable;

class OpeningHours
{
    public function isOpen(SellingPost $post, CarbonImmutable $now): bool
    {
        if ($post->operating_status !== 'operating') {
            return false;
        }
        $now = $now->setTimezone('Asia/Jakarta');
        if ($session = $this->currentSession($post, $now)) {
            return $now->greaterThanOrEqualTo($session[0]);
        }
        $time = $now->format('H:i');
        $today = $post->scheduleExceptions->first(fn ($day) => $day->date->format('Y-m-d') === $now->format('Y-m-d'));
        if ($today) {
            return ! $today->is_closed && $this->within($today, $time);
        }
        foreach ($post->weeklySchedules->where('weekday', $now->isoWeekday()) as $schedule) {
            if ($this->within($schedule, $time)) {
                return true;
            }
        }
        $previous = $now->subDay();
        $exception = $post->scheduleExceptions->first(fn ($day) => $day->date->format('Y-m-d') === $previous->format('Y-m-d'));
        $previousSlots = $exception ? ($exception->is_closed ? collect() : collect([$exception])) : $post->weeklySchedules->where('weekday', $previous->isoWeekday());
        foreach ($previousSlots as $slot) {
            if (! $slot->all_day && $slot->closes_at && $slot->opens_at && $slot->closes_at < $slot->opens_at && $time < $slot->closes_at) {
                return true;
            }
        }

        return false;
    }

    public function todayHours(SellingPost $post, CarbonImmutable $now): ?array
    {
        $now = $now->setTimezone('Asia/Jakarta');
        $session = $this->currentSession($post, $now);

        return $session ? ['opens_at' => $session[0]->format('H:i'), 'closes_at' => $session[1]->format('H:i'), 'closes_tomorrow' => $session[1]->startOfDay()->greaterThan($now->startOfDay())] : null;
    }

    public function scheduleToday(SellingPost $post, CarbonImmutable $now): array
    {
        $now = $now->setTimezone('Asia/Jakarta');
        $exception = $post->scheduleExceptions->first(fn ($day) => $day->date->format('Y-m-d') === $now->format('Y-m-d'));
        $slots = $exception ? ($exception->is_closed ? collect() : collect([$exception])) : $post->weeklySchedules->where('weekday', $now->isoWeekday())->sortBy('opens_at');
        $labels = $slots->map(fn ($slot) => $slot->all_day ? '24 jam' : substr($slot->opens_at, 0, 5).'–'.substr($slot->closes_at, 0, 5).($slot->closes_at < $slot->opens_at ? ' besok' : ''))->values();
        if (! $exception) {
            $yesterday = $now->subDay();
            $previousException = $post->scheduleExceptions->first(fn ($day) => $day->date->format('Y-m-d') === $yesterday->format('Y-m-d'));
            $previous = $previousException ? ($previousException->is_closed ? collect() : collect([$previousException])) : $post->weeklySchedules->where('weekday', $yesterday->isoWeekday());
            foreach ($previous as $slot) {
                if (! $slot->all_day && $slot->opens_at && $slot->closes_at && $slot->closes_at < $slot->opens_at && $now->format('H:i') < $slot->closes_at) {
                    $labels->prepend(substr($slot->opens_at, 0, 5).' kemarin–'.substr($slot->closes_at, 0, 5));
                }
            }
        }

        return ['label' => $labels->isEmpty() ? ($exception ? 'Libur hari ini' : 'Tidak ada jadwal hari ini') : $labels->implode(' · '), 'source' => $exception ? 'Jadwal tanggal khusus' : 'Jadwal rutin'];
    }

    private function currentSession(SellingPost $post, CarbonImmutable $now): ?array
    {
        $start = $post->today_opens_at?->setTimezone('Asia/Jakarta');
        $end = $post->today_closes_at?->setTimezone('Asia/Jakarta');

        return $start && $end && $end->greaterThan($start) && $now->greaterThanOrEqualTo($start->startOfDay()) && $now->lessThan($end) ? [$start, $end] : null;
    }

    private function within(object $slot, string $time): bool
    {
        if ($slot->all_day) {
            return true;
        }
        if (! $slot->opens_at || ! $slot->closes_at || $slot->opens_at === $slot->closes_at) {
            return false;
        }

        return $time >= $slot->opens_at && ($slot->closes_at < $slot->opens_at || $time < $slot->closes_at);
    }
}
