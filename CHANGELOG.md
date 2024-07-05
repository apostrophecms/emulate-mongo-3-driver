# CHANGELOG

## UNRELEASED

### Add

* Add integration test for `collection.count`, find-cursor.count` and `find-cursor.sort`.

## 1.0.4 (2024-07-04)

### Fix

* Update package-lock.json to reflect package.json content.

## 1.0.3 (2024-06-28)

### Fix

* Lock to `mongodb@6.7.0` to prevent issues with `cursor.count` not using the current query filter.

## 1.0.2

### Fix

* Discard connection options not permitted or required by newer MongoDB drivers. Important for `emulate-mongo-2-driver` which depends on this module.

## 1.0.1

### Fix

* Allow `FindCursor.sort` with `false` as sort key.

## 1.0.0

Initial release.
