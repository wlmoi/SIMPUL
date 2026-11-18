#!/usr/bin/env sh
set -eu
printf '%s\n' '=== Board ==='
if [ -r /proc/device-tree/model ]; then tr -d '\000' < /proc/device-tree/model; printf '\n'; fi
uname -sm
if command -v ip >/dev/null 2>&1; then ip -br -4 addr; fi
printf '%s\n' '=== USB video ==='
if command -v lsusb >/dev/null 2>&1; then lsusb; fi
if ! command -v v4l2-ctl >/dev/null 2>&1; then
    printf '%s\n' 'Install v4l-utils to enumerate capture modes.' >&2
    exit 2
fi
v4l2-ctl --list-devices
ls -l /dev/v4l/by-id/ 2>/dev/null || true
if [ "$#" -gt 0 ]; then
    v4l2-ctl -d "$1" --list-formats-ext
    v4l2-ctl -d "$1" --stream-mmap=3 --stream-count=10 --stream-to=/dev/null
fi
