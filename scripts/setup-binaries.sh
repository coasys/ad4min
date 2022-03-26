#!/bin/bash

rm -rf src-tauri/bins
mkdir src-tauri/bins

TARGET_TRIPLE=$(rustc -vV | sed -n 's/^.*host: \(.*\)*$/\1/p')

wget -O src-tauri/bins/ad4m-$TARGET_TRIPLE https://github.com/perspect3vism/ad4m-host/releases/download/v0.0.4/ad4m-macos-x64

chmod 755 src-tauri/bins/ad4m-$TARGET_TRIPLE
