[app]
title = ATLAS AI
package.name = atlasai
package.domain = org.atlas
source.dir = .
source.include_exts = py,txt,png,jpg,jpeg,kv
version = 1.0

requirements = python3,kivy==2.3.1,requests,beautifulsoup4,plyer

orientation = portrait
fullscreen = 0
android.permissions = INTERNET

android.api = 35
android.minapi = 24
android.archs = arm64-v8a

p4a.branch = v2024.01.21

[buildozer]
log_level = 2
warn_on_root = 1
