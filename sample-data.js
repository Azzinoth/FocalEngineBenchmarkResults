// Sample data for previewing the page from your disk.
// In production, commits come from the GitHub API and runs from index.json (see app.js).
window.SAMPLE_DATA = {
  "repo": "your-user/your-repo",
  "branch": "main",
  "generated_at": "2026-11-03T18:20:00Z",
  "machines": [
    {
      "id": "lab-win-01",
      "os": "Windows 11 Pro 24H2",
      "cpu": "Ryzen 7 7700X",
      "gpu": "RTX 4070 12 GB",
      "gpu_vendor": "NVIDIA",
      "driver": "581.42",
      "ram_gb": 32,
      "labels": [
        "self-hosted",
        "windows",
        "nvidia"
      ]
    },
    {
      "id": "lab-win-02",
      "os": "Windows 11 Pro 24H2",
      "cpu": "Core i5-12400",
      "gpu": "Radeon RX 7600 8 GB",
      "gpu_vendor": "AMD",
      "driver": "25.9.2",
      "ram_gb": 16,
      "labels": [
        "self-hosted",
        "windows",
        "amd"
      ]
    },
    {
      "id": "lab-win-03",
      "os": "Windows 10 22H2",
      "cpu": "Core i7-6700",
      "gpu": "GTX 1060 6 GB",
      "gpu_vendor": "NVIDIA",
      "driver": "566.36",
      "ram_gb": 16,
      "labels": [
        "self-hosted",
        "windows",
        "legacy"
      ]
    }
  ],
  "commits": [
    {
      "sha": "9f3c2e1e0b870f9de98a151041a8002a6834b887",
      "message": "Add depth fade to water shader",
      "author": "Kindrat",
      "date": "2026-11-03T17:56:00Z",
      "url": "https://github.com/your-user/your-repo/commit/9f3c2e1e0b870f9de98a151041a8002a6834b887"
    },
    {
      "sha": "4be81a0b552996ca1bb227e240260af6cfcd3f56",
      "message": "Fix sun direction after uniform refactor",
      "author": "Kindrat",
      "date": "2026-11-02T22:20:00Z",
      "url": "https://github.com/your-user/your-repo/commit/4be81a0b552996ca1bb227e240260af6cfcd3f56"
    },
    {
      "sha": "71d0c9b216a0090202789075588586a16c3a2cd1",
      "message": "Refactor lighting uniforms into one buffer",
      "author": "Kindrat",
      "date": "2026-11-02T15:20:00Z",
      "url": "https://github.com/your-user/your-repo/commit/71d0c9b216a0090202789075588586a16c3a2cd1"
    },
    {
      "sha": "c08e5f259a4265f70a5c2ce4971826acc2ff0cb8",
      "message": "Update README build steps",
      "author": "Kindrat",
      "date": "2026-11-01T20:20:00Z",
      "url": "https://github.com/your-user/your-repo/commit/c08e5f259a4265f70a5c2ce4971826acc2ff0cb8"
    },
    {
      "sha": "2a6f9d47f32f407061ff4a1d6069bb237b10b076",
      "message": "Cache compiled shaders on disk",
      "author": "Kindrat",
      "date": "2026-10-31T20:20:00Z",
      "url": "https://github.com/your-user/your-repo/commit/2a6f9d47f32f407061ff4a1d6069bb237b10b076"
    },
    {
      "sha": "e51b7c36a9ded49a6cadc5d2dbdd8dc265373ced",
      "message": "Speed up point cloud upload",
      "author": "Kindrat",
      "date": "2026-10-30T18:20:00Z",
      "url": "https://github.com/your-user/your-repo/commit/e51b7c36a9ded49a6cadc5d2dbdd8dc265373ced"
    },
    {
      "sha": "05fe3a8d45f3c44d2b1a0c3a66b38c8877dce579",
      "message": "Merge pull request #41 from a-contributor/typo-fixes",
      "author": "a-contributor",
      "date": "2026-10-29T18:20:00Z",
      "url": "https://github.com/your-user/your-repo/commit/05fe3a8d45f3c44d2b1a0c3a66b38c8877dce579"
    },
    {
      "sha": "8d2047a1f82a4d1ad4c9e1d119c41981f679ef3d",
      "message": "Add contour line overlay",
      "author": "Kindrat",
      "date": "2026-10-28T12:20:00Z",
      "url": "https://github.com/your-user/your-repo/commit/8d2047a1f82a4d1ad4c9e1d119c41981f679ef3d"
    },
    {
      "sha": "3c9e1f64d008d3ff3db5efe55f846ffc7259393b",
      "message": "Fix crash when window is minimized",
      "author": "Kindrat",
      "date": "2026-10-26T10:20:00Z",
      "url": "https://github.com/your-user/your-repo/commit/3c9e1f64d008d3ff3db5efe55f846ffc7259393b"
    },
    {
      "sha": "b7a4d209d3da2a10aeb0b9759bb5b1d469303bb1",
      "message": "Bump Emscripten to 4.0",
      "author": "Kindrat",
      "date": "2026-10-23T22:20:00Z",
      "url": "https://github.com/your-user/your-repo/commit/b7a4d209d3da2a10aeb0b9759bb5b1d469303bb1"
    },
    {
      "sha": "f2c81d9541934f76213a676770c24148f49a7d38",
      "message": "Add GPU timer queries to stats",
      "author": "Kindrat",
      "date": "2026-10-21T00:20:00Z",
      "url": "https://github.com/your-user/your-repo/commit/f2c81d9541934f76213a676770c24148f49a7d38"
    },
    {
      "sha": "6ad3b5720457bf92556ab0a19cbdd15217fe392a",
      "message": "Add screenshot test suite",
      "author": "Kindrat",
      "date": "2026-10-18T02:20:00Z",
      "url": "https://github.com/your-user/your-repo/commit/6ad3b5720457bf92556ab0a19cbdd15217fe392a"
    }
  ],
  "runs": {
    "6ad3b5720457bf92556ab0a19cbdd15217fe392a": {
      "lab-win-01": {
        "status": "passed",
        "started": "2026-10-18T02:42:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800015592",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 173040
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 32960
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 2920
          },
          {
            "name": "Screenshot: Terrain",
            "status": "passed",
            "ms": 1078
          },
          {
            "name": "Screenshot: Water surface",
            "status": "passed",
            "ms": 965
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 1347
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "passed",
            "ms": 2132
          },
          {
            "name": "Screenshot: Contours",
            "status": "passed",
            "ms": 1307
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "passed",
            "ms": 2336
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "passed",
            "ms": 30000
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain.jpg",
            "thumb": "screenshots/thumbs/terrain.jpg",
            "status": "passed",
            "diff_pct": 0.54
          },
          {
            "scene": "Water surface",
            "file": "screenshots/water.jpg",
            "thumb": "screenshots/thumbs/water.jpg",
            "status": "passed",
            "diff_pct": 0.35
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.02
          },
          {
            "scene": "Volume slice",
            "file": "screenshots/volume_slice.jpg",
            "thumb": "screenshots/thumbs/volume_slice.jpg",
            "status": "passed",
            "diff_pct": 0.14
          },
          {
            "scene": "Contours",
            "file": "screenshots/contours.jpg",
            "thumb": "screenshots/thumbs/contours.jpg",
            "status": "passed",
            "diff_pct": 0.02
          },
          {
            "scene": "UI overlay",
            "file": "screenshots/ui_overlay.jpg",
            "thumb": "screenshots/thumbs/ui_overlay.jpg",
            "status": "passed",
            "diff_pct": 0.43
          }
        ],
        "stats": {
          "fps_avg": 161.7,
          "frame_ms_p95": 7.55,
          "gpu_mem_mb": 1467,
          "load_ms": 2920
        },
        "duration_sec": 412,
        "finished": "2026-10-18T02:48:52Z"
      }
    },
    "f2c81d9541934f76213a676770c24148f49a7d38": {
      "lab-win-01": {
        "status": "passed",
        "started": "2026-10-21T00:39:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800071579",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 173460
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 33040
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 2857
          },
          {
            "name": "Screenshot: Terrain",
            "status": "passed",
            "ms": 1596
          },
          {
            "name": "Screenshot: Water surface",
            "status": "passed",
            "ms": 1340
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 1589
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "passed",
            "ms": 1678
          },
          {
            "name": "Screenshot: Contours",
            "status": "passed",
            "ms": 1604
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "passed",
            "ms": 988
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "passed",
            "ms": 30000
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain.jpg",
            "thumb": "screenshots/thumbs/terrain.jpg",
            "status": "passed",
            "diff_pct": 0.42
          },
          {
            "scene": "Water surface",
            "file": "screenshots/water.jpg",
            "thumb": "screenshots/thumbs/water.jpg",
            "status": "passed",
            "diff_pct": 0.17
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.57
          },
          {
            "scene": "Volume slice",
            "file": "screenshots/volume_slice.jpg",
            "thumb": "screenshots/thumbs/volume_slice.jpg",
            "status": "passed",
            "diff_pct": 0.06
          },
          {
            "scene": "Contours",
            "file": "screenshots/contours.jpg",
            "thumb": "screenshots/thumbs/contours.jpg",
            "status": "passed",
            "diff_pct": 0.06
          },
          {
            "scene": "UI overlay",
            "file": "screenshots/ui_overlay.jpg",
            "thumb": "screenshots/thumbs/ui_overlay.jpg",
            "status": "passed",
            "diff_pct": 0.36
          }
        ],
        "stats": {
          "fps_avg": 162.6,
          "frame_ms_p95": 7.62,
          "gpu_mem_mb": 1493,
          "load_ms": 2857
        },
        "duration_sec": 413,
        "finished": "2026-10-21T00:45:53Z"
      },
      "lab-win-02": {
        "status": "passed",
        "started": "2026-10-21T00:45:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800132796",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 220500
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 42000
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 3605
          },
          {
            "name": "Screenshot: Terrain",
            "status": "passed",
            "ms": 1640
          },
          {
            "name": "Screenshot: Water surface",
            "status": "passed",
            "ms": 2342
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 2254
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "passed",
            "ms": 1492
          },
          {
            "name": "Screenshot: Contours",
            "status": "passed",
            "ms": 1376
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "passed",
            "ms": 1678
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "passed",
            "ms": 30000
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain.jpg",
            "thumb": "screenshots/thumbs/terrain.jpg",
            "status": "passed",
            "diff_pct": 0.37
          },
          {
            "scene": "Water surface",
            "file": "screenshots/water.jpg",
            "thumb": "screenshots/thumbs/water.jpg",
            "status": "passed",
            "diff_pct": 0.35
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.04
          },
          {
            "scene": "Volume slice",
            "file": "screenshots/volume_slice.jpg",
            "thumb": "screenshots/thumbs/volume_slice.jpg",
            "status": "passed",
            "diff_pct": 0.14
          },
          {
            "scene": "Contours",
            "file": "screenshots/contours.jpg",
            "thumb": "screenshots/thumbs/contours.jpg",
            "status": "passed",
            "diff_pct": 0.59
          },
          {
            "scene": "UI overlay",
            "file": "screenshots/ui_overlay.jpg",
            "thumb": "screenshots/thumbs/ui_overlay.jpg",
            "status": "passed",
            "diff_pct": 0.52
          }
        ],
        "stats": {
          "fps_avg": 121.1,
          "frame_ms_p95": 10.55,
          "gpu_mem_mb": 1384,
          "load_ms": 3605
        },
        "duration_sec": 525,
        "finished": "2026-10-21T00:53:45Z"
      },
      "lab-win-03": {
        "status": "passed",
        "started": "2026-10-21T00:30:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800193225",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 325080
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 61920
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 6046
          },
          {
            "name": "Screenshot: Terrain",
            "status": "passed",
            "ms": 2227
          },
          {
            "name": "Screenshot: Water surface",
            "status": "passed",
            "ms": 2200
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 2393
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "passed",
            "ms": 1846
          },
          {
            "name": "Screenshot: Contours",
            "status": "passed",
            "ms": 2210
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "passed",
            "ms": 1349
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "passed",
            "ms": 30000
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain.jpg",
            "thumb": "screenshots/thumbs/terrain.jpg",
            "status": "passed",
            "diff_pct": 0.56
          },
          {
            "scene": "Water surface",
            "file": "screenshots/water.jpg",
            "thumb": "screenshots/thumbs/water.jpg",
            "status": "passed",
            "diff_pct": 0.04
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.1
          },
          {
            "scene": "Volume slice",
            "file": "screenshots/volume_slice.jpg",
            "thumb": "screenshots/thumbs/volume_slice.jpg",
            "status": "passed",
            "diff_pct": 0.15
          },
          {
            "scene": "Contours",
            "file": "screenshots/contours.jpg",
            "thumb": "screenshots/thumbs/contours.jpg",
            "status": "passed",
            "diff_pct": 0.23
          },
          {
            "scene": "UI overlay",
            "file": "screenshots/ui_overlay.jpg",
            "thumb": "screenshots/thumbs/ui_overlay.jpg",
            "status": "passed",
            "diff_pct": 0.41
          }
        ],
        "stats": {
          "fps_avg": 63.3,
          "frame_ms_p95": 19.72,
          "gpu_mem_mb": 1205,
          "load_ms": 6046
        },
        "duration_sec": 774,
        "finished": "2026-10-21T00:42:54Z"
      }
    },
    "b7a4d209d3da2a10aeb0b9759bb5b1d469303bb1": {
      "lab-win-01": {
        "status": "passed",
        "started": "2026-10-23T22:43:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800236729",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 170940
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 32560
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 2859
          },
          {
            "name": "Screenshot: Terrain",
            "status": "passed",
            "ms": 1332
          },
          {
            "name": "Screenshot: Water surface",
            "status": "passed",
            "ms": 2061
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 1544
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "passed",
            "ms": 1922
          },
          {
            "name": "Screenshot: Contours",
            "status": "passed",
            "ms": 2216
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "passed",
            "ms": 1442
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "passed",
            "ms": 30000
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain.jpg",
            "thumb": "screenshots/thumbs/terrain.jpg",
            "status": "passed",
            "diff_pct": 0.16
          },
          {
            "scene": "Water surface",
            "file": "screenshots/water.jpg",
            "thumb": "screenshots/thumbs/water.jpg",
            "status": "passed",
            "diff_pct": 0.55
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.53
          },
          {
            "scene": "Volume slice",
            "file": "screenshots/volume_slice.jpg",
            "thumb": "screenshots/thumbs/volume_slice.jpg",
            "status": "passed",
            "diff_pct": 0.13
          },
          {
            "scene": "Contours",
            "file": "screenshots/contours.jpg",
            "thumb": "screenshots/thumbs/contours.jpg",
            "status": "passed",
            "diff_pct": 0.24
          },
          {
            "scene": "UI overlay",
            "file": "screenshots/ui_overlay.jpg",
            "thumb": "screenshots/thumbs/ui_overlay.jpg",
            "status": "passed",
            "diff_pct": 0.28
          }
        ],
        "stats": {
          "fps_avg": 165.7,
          "frame_ms_p95": 7.66,
          "gpu_mem_mb": 1467,
          "load_ms": 2859
        },
        "duration_sec": 407,
        "finished": "2026-10-23T22:49:47Z"
      },
      "lab-win-02": {
        "status": "passed",
        "started": "2026-10-23T22:26:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800270054",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 218820
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 41680
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 3592
          },
          {
            "name": "Screenshot: Terrain",
            "status": "passed",
            "ms": 1183
          },
          {
            "name": "Screenshot: Water surface",
            "status": "passed",
            "ms": 1086
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 1124
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "passed",
            "ms": 1227
          },
          {
            "name": "Screenshot: Contours",
            "status": "passed",
            "ms": 1764
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "passed",
            "ms": 1688
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "passed",
            "ms": 30000
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain.jpg",
            "thumb": "screenshots/thumbs/terrain.jpg",
            "status": "passed",
            "diff_pct": 0.22
          },
          {
            "scene": "Water surface",
            "file": "screenshots/water.jpg",
            "thumb": "screenshots/thumbs/water.jpg",
            "status": "passed",
            "diff_pct": 0.31
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.45
          },
          {
            "scene": "Volume slice",
            "file": "screenshots/volume_slice.jpg",
            "thumb": "screenshots/thumbs/volume_slice.jpg",
            "status": "passed",
            "diff_pct": 0.09
          },
          {
            "scene": "Contours",
            "file": "screenshots/contours.jpg",
            "thumb": "screenshots/thumbs/contours.jpg",
            "status": "passed",
            "diff_pct": 0.48
          },
          {
            "scene": "UI overlay",
            "file": "screenshots/ui_overlay.jpg",
            "thumb": "screenshots/thumbs/ui_overlay.jpg",
            "status": "passed",
            "diff_pct": 0.36
          }
        ],
        "stats": {
          "fps_avg": 121.9,
          "frame_ms_p95": 10.41,
          "gpu_mem_mb": 1400,
          "load_ms": 3592
        },
        "duration_sec": 521,
        "finished": "2026-10-23T22:34:41Z"
      }
    },
    "3c9e1f64d008d3ff3db5efe55f846ffc7259393b": {
      "lab-win-01": {
        "status": "passed",
        "started": "2026-10-26T10:34:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800349158",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 169260
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 32240
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 2931
          },
          {
            "name": "Screenshot: Terrain",
            "status": "passed",
            "ms": 2296
          },
          {
            "name": "Screenshot: Water surface",
            "status": "passed",
            "ms": 1446
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 1596
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "passed",
            "ms": 1790
          },
          {
            "name": "Screenshot: Contours",
            "status": "passed",
            "ms": 906
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "passed",
            "ms": 2373
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "passed",
            "ms": 30000
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain.jpg",
            "thumb": "screenshots/thumbs/terrain.jpg",
            "status": "passed",
            "diff_pct": 0.43
          },
          {
            "scene": "Water surface",
            "file": "screenshots/water.jpg",
            "thumb": "screenshots/thumbs/water.jpg",
            "status": "passed",
            "diff_pct": 0.53
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.46
          },
          {
            "scene": "Volume slice",
            "file": "screenshots/volume_slice.jpg",
            "thumb": "screenshots/thumbs/volume_slice.jpg",
            "status": "passed",
            "diff_pct": 0.07
          },
          {
            "scene": "Contours",
            "file": "screenshots/contours.jpg",
            "thumb": "screenshots/thumbs/contours.jpg",
            "status": "passed",
            "diff_pct": 0.09
          },
          {
            "scene": "UI overlay",
            "file": "screenshots/ui_overlay.jpg",
            "thumb": "screenshots/thumbs/ui_overlay.jpg",
            "status": "passed",
            "diff_pct": 0.57
          }
        ],
        "stats": {
          "fps_avg": 166.4,
          "frame_ms_p95": 7.61,
          "gpu_mem_mb": 1500,
          "load_ms": 2931
        },
        "duration_sec": 403,
        "finished": "2026-10-26T10:40:43Z"
      },
      "lab-win-02": {
        "status": "passed",
        "started": "2026-10-26T10:30:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800415770",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 220500
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 42000
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 3613
          },
          {
            "name": "Screenshot: Terrain",
            "status": "passed",
            "ms": 1307
          },
          {
            "name": "Screenshot: Water surface",
            "status": "passed",
            "ms": 1230
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 1986
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "passed",
            "ms": 2126
          },
          {
            "name": "Screenshot: Contours",
            "status": "passed",
            "ms": 939
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "passed",
            "ms": 1643
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "passed",
            "ms": 30000
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain.jpg",
            "thumb": "screenshots/thumbs/terrain.jpg",
            "status": "passed",
            "diff_pct": 0.3
          },
          {
            "scene": "Water surface",
            "file": "screenshots/water.jpg",
            "thumb": "screenshots/thumbs/water.jpg",
            "status": "passed",
            "diff_pct": 0.09
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.32
          },
          {
            "scene": "Volume slice",
            "file": "screenshots/volume_slice.jpg",
            "thumb": "screenshots/thumbs/volume_slice.jpg",
            "status": "passed",
            "diff_pct": 0.55
          },
          {
            "scene": "Contours",
            "file": "screenshots/contours.jpg",
            "thumb": "screenshots/thumbs/contours.jpg",
            "status": "passed",
            "diff_pct": 0.19
          },
          {
            "scene": "UI overlay",
            "file": "screenshots/ui_overlay.jpg",
            "thumb": "screenshots/thumbs/ui_overlay.jpg",
            "status": "passed",
            "diff_pct": 0.07
          }
        ],
        "stats": {
          "fps_avg": 122.0,
          "frame_ms_p95": 10.4,
          "gpu_mem_mb": 1373,
          "load_ms": 3613
        },
        "duration_sec": 525,
        "finished": "2026-10-26T10:38:45Z"
      }
    },
    "8d2047a1f82a4d1ad4c9e1d119c41981f679ef3d": {
      "lab-win-01": {
        "status": "passed",
        "started": "2026-10-28T12:47:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800457076",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 173040
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 32960
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 2863
          },
          {
            "name": "Screenshot: Terrain",
            "status": "passed",
            "ms": 1990
          },
          {
            "name": "Screenshot: Water surface",
            "status": "passed",
            "ms": 1162
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 2025
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "passed",
            "ms": 1980
          },
          {
            "name": "Screenshot: Contours",
            "status": "passed",
            "ms": 1766
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "passed",
            "ms": 2004
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "passed",
            "ms": 30000
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain.jpg",
            "thumb": "screenshots/thumbs/terrain.jpg",
            "status": "passed",
            "diff_pct": 0.49
          },
          {
            "scene": "Water surface",
            "file": "screenshots/water.jpg",
            "thumb": "screenshots/thumbs/water.jpg",
            "status": "passed",
            "diff_pct": 0.46
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.4
          },
          {
            "scene": "Volume slice",
            "file": "screenshots/volume_slice.jpg",
            "thumb": "screenshots/thumbs/volume_slice.jpg",
            "status": "passed",
            "diff_pct": 0.1
          },
          {
            "scene": "Contours",
            "file": "screenshots/contours.jpg",
            "thumb": "screenshots/thumbs/contours.jpg",
            "status": "passed",
            "diff_pct": 0.52
          },
          {
            "scene": "UI overlay",
            "file": "screenshots/ui_overlay.jpg",
            "thumb": "screenshots/thumbs/ui_overlay.jpg",
            "status": "passed",
            "diff_pct": 0.58
          }
        ],
        "stats": {
          "fps_avg": 156.2,
          "frame_ms_p95": 7.86,
          "gpu_mem_mb": 1482,
          "load_ms": 2863
        },
        "duration_sec": 412,
        "finished": "2026-10-28T12:53:52Z"
      },
      "lab-win-02": {
        "status": "passed",
        "started": "2026-10-28T12:46:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800484441",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 220920
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 42080
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 3586
          },
          {
            "name": "Screenshot: Terrain",
            "status": "passed",
            "ms": 1407
          },
          {
            "name": "Screenshot: Water surface",
            "status": "passed",
            "ms": 1592
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 2034
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "passed",
            "ms": 1351
          },
          {
            "name": "Screenshot: Contours",
            "status": "passed",
            "ms": 2349
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "passed",
            "ms": 1368
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "passed",
            "ms": 30000
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain.jpg",
            "thumb": "screenshots/thumbs/terrain.jpg",
            "status": "passed",
            "diff_pct": 0.27
          },
          {
            "scene": "Water surface",
            "file": "screenshots/water.jpg",
            "thumb": "screenshots/thumbs/water.jpg",
            "status": "passed",
            "diff_pct": 0.13
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.01
          },
          {
            "scene": "Volume slice",
            "file": "screenshots/volume_slice.jpg",
            "thumb": "screenshots/thumbs/volume_slice.jpg",
            "status": "passed",
            "diff_pct": 0.14
          },
          {
            "scene": "Contours",
            "file": "screenshots/contours.jpg",
            "thumb": "screenshots/thumbs/contours.jpg",
            "status": "passed",
            "diff_pct": 0.0
          },
          {
            "scene": "UI overlay",
            "file": "screenshots/ui_overlay.jpg",
            "thumb": "screenshots/thumbs/ui_overlay.jpg",
            "status": "passed",
            "diff_pct": 0.38
          }
        ],
        "stats": {
          "fps_avg": 116.9,
          "frame_ms_p95": 10.8,
          "gpu_mem_mb": 1397,
          "load_ms": 3586
        },
        "duration_sec": 526,
        "finished": "2026-10-28T12:54:46Z"
      },
      "lab-win-03": {
        "status": "passed",
        "started": "2026-10-28T12:24:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800489558",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 324660
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 61840
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 6130
          },
          {
            "name": "Screenshot: Terrain",
            "status": "passed",
            "ms": 2069
          },
          {
            "name": "Screenshot: Water surface",
            "status": "passed",
            "ms": 1397
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 1733
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "passed",
            "ms": 1098
          },
          {
            "name": "Screenshot: Contours",
            "status": "passed",
            "ms": 1625
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "passed",
            "ms": 1856
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "passed",
            "ms": 30000
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain.jpg",
            "thumb": "screenshots/thumbs/terrain.jpg",
            "status": "passed",
            "diff_pct": 0.08
          },
          {
            "scene": "Water surface",
            "file": "screenshots/water.jpg",
            "thumb": "screenshots/thumbs/water.jpg",
            "status": "passed",
            "diff_pct": 0.35
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.47
          },
          {
            "scene": "Volume slice",
            "file": "screenshots/volume_slice.jpg",
            "thumb": "screenshots/thumbs/volume_slice.jpg",
            "status": "passed",
            "diff_pct": 0.11
          },
          {
            "scene": "Contours",
            "file": "screenshots/contours.jpg",
            "thumb": "screenshots/thumbs/contours.jpg",
            "status": "passed",
            "diff_pct": 0.4
          },
          {
            "scene": "UI overlay",
            "file": "screenshots/ui_overlay.jpg",
            "thumb": "screenshots/thumbs/ui_overlay.jpg",
            "status": "passed",
            "diff_pct": 0.25
          }
        ],
        "stats": {
          "fps_avg": 61.1,
          "frame_ms_p95": 20.36,
          "gpu_mem_mb": 1200,
          "load_ms": 6130
        },
        "duration_sec": 773,
        "finished": "2026-10-28T12:36:53Z"
      }
    },
    "05fe3a8d45f3c44d2b1a0c3a66b38c8877dce579": {
      "lab-win-01": {
        "status": "passed",
        "started": "2026-10-29T18:45:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800497658",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 171360
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 32640
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 2891
          },
          {
            "name": "Screenshot: Terrain",
            "status": "passed",
            "ms": 1409
          },
          {
            "name": "Screenshot: Water surface",
            "status": "passed",
            "ms": 1998
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 1764
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "passed",
            "ms": 1847
          },
          {
            "name": "Screenshot: Contours",
            "status": "passed",
            "ms": 1054
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "passed",
            "ms": 2027
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "passed",
            "ms": 30000
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain.jpg",
            "thumb": "screenshots/thumbs/terrain.jpg",
            "status": "passed",
            "diff_pct": 0.52
          },
          {
            "scene": "Water surface",
            "file": "screenshots/water.jpg",
            "thumb": "screenshots/thumbs/water.jpg",
            "status": "passed",
            "diff_pct": 0.11
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.27
          },
          {
            "scene": "Volume slice",
            "file": "screenshots/volume_slice.jpg",
            "thumb": "screenshots/thumbs/volume_slice.jpg",
            "status": "passed",
            "diff_pct": 0.11
          },
          {
            "scene": "Contours",
            "file": "screenshots/contours.jpg",
            "thumb": "screenshots/thumbs/contours.jpg",
            "status": "passed",
            "diff_pct": 0.15
          },
          {
            "scene": "UI overlay",
            "file": "screenshots/ui_overlay.jpg",
            "thumb": "screenshots/thumbs/ui_overlay.jpg",
            "status": "passed",
            "diff_pct": 0.27
          }
        ],
        "stats": {
          "fps_avg": 158.3,
          "frame_ms_p95": 8.03,
          "gpu_mem_mb": 1462,
          "load_ms": 2891
        },
        "duration_sec": 408,
        "finished": "2026-10-29T18:51:48Z"
      },
      "lab-win-02": {
        "status": "passed",
        "started": "2026-10-29T18:25:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800505288",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 219660
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 41840
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 3556
          },
          {
            "name": "Screenshot: Terrain",
            "status": "passed",
            "ms": 1732
          },
          {
            "name": "Screenshot: Water surface",
            "status": "passed",
            "ms": 1337
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 1020
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "passed",
            "ms": 904
          },
          {
            "name": "Screenshot: Contours",
            "status": "passed",
            "ms": 1443
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "passed",
            "ms": 1831
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "passed",
            "ms": 30000
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain.jpg",
            "thumb": "screenshots/thumbs/terrain.jpg",
            "status": "passed",
            "diff_pct": 0.14
          },
          {
            "scene": "Water surface",
            "file": "screenshots/water.jpg",
            "thumb": "screenshots/thumbs/water.jpg",
            "status": "passed",
            "diff_pct": 0.29
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.52
          },
          {
            "scene": "Volume slice",
            "file": "screenshots/volume_slice.jpg",
            "thumb": "screenshots/thumbs/volume_slice.jpg",
            "status": "passed",
            "diff_pct": 0.1
          },
          {
            "scene": "Contours",
            "file": "screenshots/contours.jpg",
            "thumb": "screenshots/thumbs/contours.jpg",
            "status": "passed",
            "diff_pct": 0.59
          },
          {
            "scene": "UI overlay",
            "file": "screenshots/ui_overlay.jpg",
            "thumb": "screenshots/thumbs/ui_overlay.jpg",
            "status": "passed",
            "diff_pct": 0.56
          }
        ],
        "stats": {
          "fps_avg": 116.7,
          "frame_ms_p95": 10.85,
          "gpu_mem_mb": 1369,
          "load_ms": 3556
        },
        "duration_sec": 523,
        "finished": "2026-10-29T18:33:43Z"
      }
    },
    "e51b7c36a9ded49a6cadc5d2dbdd8dc265373ced": {
      "lab-win-01": {
        "status": "passed",
        "started": "2026-10-30T18:31:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800561732",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 162540
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 30960
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 1865
          },
          {
            "name": "Screenshot: Terrain",
            "status": "passed",
            "ms": 1345
          },
          {
            "name": "Screenshot: Water surface",
            "status": "passed",
            "ms": 2086
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 1024
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "passed",
            "ms": 1017
          },
          {
            "name": "Screenshot: Contours",
            "status": "passed",
            "ms": 1876
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "passed",
            "ms": 1987
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "passed",
            "ms": 30000
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain.jpg",
            "thumb": "screenshots/thumbs/terrain.jpg",
            "status": "passed",
            "diff_pct": 0.11
          },
          {
            "scene": "Water surface",
            "file": "screenshots/water.jpg",
            "thumb": "screenshots/thumbs/water.jpg",
            "status": "passed",
            "diff_pct": 0.58
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.44
          },
          {
            "scene": "Volume slice",
            "file": "screenshots/volume_slice.jpg",
            "thumb": "screenshots/thumbs/volume_slice.jpg",
            "status": "passed",
            "diff_pct": 0.45
          },
          {
            "scene": "Contours",
            "file": "screenshots/contours.jpg",
            "thumb": "screenshots/thumbs/contours.jpg",
            "status": "passed",
            "diff_pct": 0.03
          },
          {
            "scene": "UI overlay",
            "file": "screenshots/ui_overlay.jpg",
            "thumb": "screenshots/thumbs/ui_overlay.jpg",
            "status": "passed",
            "diff_pct": 0.3
          }
        ],
        "stats": {
          "fps_avg": 158.4,
          "frame_ms_p95": 7.97,
          "gpu_mem_mb": 1492,
          "load_ms": 1865
        },
        "duration_sec": 387,
        "finished": "2026-10-30T18:37:27Z"
      },
      "lab-win-02": {
        "status": "passed",
        "started": "2026-10-30T18:27:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800570187",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 207480
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 39520
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 2310
          },
          {
            "name": "Screenshot: Terrain",
            "status": "passed",
            "ms": 1145
          },
          {
            "name": "Screenshot: Water surface",
            "status": "passed",
            "ms": 2066
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 2117
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "passed",
            "ms": 1067
          },
          {
            "name": "Screenshot: Contours",
            "status": "passed",
            "ms": 2095
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "passed",
            "ms": 1547
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "passed",
            "ms": 30000
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain.jpg",
            "thumb": "screenshots/thumbs/terrain.jpg",
            "status": "passed",
            "diff_pct": 0.14
          },
          {
            "scene": "Water surface",
            "file": "screenshots/water.jpg",
            "thumb": "screenshots/thumbs/water.jpg",
            "status": "passed",
            "diff_pct": 0.56
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.15
          },
          {
            "scene": "Volume slice",
            "file": "screenshots/volume_slice.jpg",
            "thumb": "screenshots/thumbs/volume_slice.jpg",
            "status": "passed",
            "diff_pct": 0.02
          },
          {
            "scene": "Contours",
            "file": "screenshots/contours.jpg",
            "thumb": "screenshots/thumbs/contours.jpg",
            "status": "passed",
            "diff_pct": 0.25
          },
          {
            "scene": "UI overlay",
            "file": "screenshots/ui_overlay.jpg",
            "thumb": "screenshots/thumbs/ui_overlay.jpg",
            "status": "passed",
            "diff_pct": 0.34
          }
        ],
        "stats": {
          "fps_avg": 117.8,
          "frame_ms_p95": 10.7,
          "gpu_mem_mb": 1376,
          "load_ms": 2310
        },
        "duration_sec": 494,
        "finished": "2026-10-30T18:35:14Z"
      }
    },
    "2a6f9d47f32f407061ff4a1d6069bb237b10b076": {
      "lab-win-01": {
        "status": "passed",
        "started": "2026-10-31T20:30:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800597959",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 156660
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 29840
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 1101
          },
          {
            "name": "Screenshot: Terrain",
            "status": "passed",
            "ms": 1048
          },
          {
            "name": "Screenshot: Water surface",
            "status": "passed",
            "ms": 2172
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 1104
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "passed",
            "ms": 1336
          },
          {
            "name": "Screenshot: Contours",
            "status": "passed",
            "ms": 1171
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "passed",
            "ms": 1040
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "passed",
            "ms": 30000
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain.jpg",
            "thumb": "screenshots/thumbs/terrain.jpg",
            "status": "passed",
            "diff_pct": 0.27
          },
          {
            "scene": "Water surface",
            "file": "screenshots/water.jpg",
            "thumb": "screenshots/thumbs/water.jpg",
            "status": "passed",
            "diff_pct": 0.01
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.6
          },
          {
            "scene": "Volume slice",
            "file": "screenshots/volume_slice.jpg",
            "thumb": "screenshots/thumbs/volume_slice.jpg",
            "status": "passed",
            "diff_pct": 0.04
          },
          {
            "scene": "Contours",
            "file": "screenshots/contours.jpg",
            "thumb": "screenshots/thumbs/contours.jpg",
            "status": "passed",
            "diff_pct": 0.3
          },
          {
            "scene": "UI overlay",
            "file": "screenshots/ui_overlay.jpg",
            "thumb": "screenshots/thumbs/ui_overlay.jpg",
            "status": "passed",
            "diff_pct": 0.56
          }
        ],
        "stats": {
          "fps_avg": 158.2,
          "frame_ms_p95": 7.87,
          "gpu_mem_mb": 1469,
          "load_ms": 1101
        },
        "duration_sec": 373,
        "finished": "2026-10-31T20:36:13Z"
      },
      "lab-win-02": {
        "status": "failed",
        "started": "2026-10-31T20:29:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800647393",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 200760
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 38240
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 1374
          },
          {
            "name": "Screenshot: Terrain",
            "status": "passed",
            "ms": 1983
          },
          {
            "name": "Screenshot: Water surface",
            "status": "failed",
            "ms": 2035,
            "message": "Shader program binary rejected by driver; fallback compile failed"
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 2258
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "passed",
            "ms": 1175
          },
          {
            "name": "Screenshot: Contours",
            "status": "passed",
            "ms": 1119
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "passed",
            "ms": 1218
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "passed",
            "ms": 30000
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain.jpg",
            "thumb": "screenshots/thumbs/terrain.jpg",
            "status": "passed",
            "diff_pct": 0.48
          },
          {
            "scene": "Water surface",
            "file": "screenshots/error_missing_shader.jpg",
            "thumb": "screenshots/thumbs/error_missing_shader.jpg",
            "status": "failed",
            "diff_pct": 100.0
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.18
          },
          {
            "scene": "Volume slice",
            "file": "screenshots/volume_slice.jpg",
            "thumb": "screenshots/thumbs/volume_slice.jpg",
            "status": "passed",
            "diff_pct": 0.06
          },
          {
            "scene": "Contours",
            "file": "screenshots/contours.jpg",
            "thumb": "screenshots/thumbs/contours.jpg",
            "status": "passed",
            "diff_pct": 0.16
          },
          {
            "scene": "UI overlay",
            "file": "screenshots/ui_overlay.jpg",
            "thumb": "screenshots/thumbs/ui_overlay.jpg",
            "status": "passed",
            "diff_pct": 0.45
          }
        ],
        "stats": {
          "fps_avg": 115.4,
          "frame_ms_p95": 10.81,
          "gpu_mem_mb": 1391,
          "load_ms": 1374
        },
        "duration_sec": 478,
        "finished": "2026-10-31T20:36:58Z"
      },
      "lab-win-03": {
        "status": "passed",
        "started": "2026-10-31T20:30:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800685323",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 294840
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 56160
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 2351
          },
          {
            "name": "Screenshot: Terrain",
            "status": "passed",
            "ms": 1004
          },
          {
            "name": "Screenshot: Water surface",
            "status": "passed",
            "ms": 1767
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 990
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "passed",
            "ms": 1167
          },
          {
            "name": "Screenshot: Contours",
            "status": "passed",
            "ms": 1436
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "passed",
            "ms": 1804
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "passed",
            "ms": 30000
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain.jpg",
            "thumb": "screenshots/thumbs/terrain.jpg",
            "status": "passed",
            "diff_pct": 0.29
          },
          {
            "scene": "Water surface",
            "file": "screenshots/water.jpg",
            "thumb": "screenshots/thumbs/water.jpg",
            "status": "passed",
            "diff_pct": 0.06
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.5
          },
          {
            "scene": "Volume slice",
            "file": "screenshots/volume_slice.jpg",
            "thumb": "screenshots/thumbs/volume_slice.jpg",
            "status": "passed",
            "diff_pct": 0.0
          },
          {
            "scene": "Contours",
            "file": "screenshots/contours.jpg",
            "thumb": "screenshots/thumbs/contours.jpg",
            "status": "passed",
            "diff_pct": 0.38
          },
          {
            "scene": "UI overlay",
            "file": "screenshots/ui_overlay.jpg",
            "thumb": "screenshots/thumbs/ui_overlay.jpg",
            "status": "passed",
            "diff_pct": 0.1
          }
        ],
        "stats": {
          "fps_avg": 60.7,
          "frame_ms_p95": 20.76,
          "gpu_mem_mb": 1199,
          "load_ms": 2351
        },
        "duration_sec": 702,
        "finished": "2026-10-31T20:41:42Z"
      }
    },
    "71d0c9b216a0090202789075588586a16c3a2cd1": {
      "lab-win-01": {
        "status": "failed",
        "started": "2026-11-02T15:39:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800742380",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 154560
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 29440
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 1119
          },
          {
            "name": "Screenshot: Terrain",
            "status": "failed",
            "ms": 1656,
            "message": "Differs from reference by 18.4% (limit 2%)"
          },
          {
            "name": "Screenshot: Water surface",
            "status": "passed",
            "ms": 1203
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 985
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "passed",
            "ms": 981
          },
          {
            "name": "Screenshot: Contours",
            "status": "passed",
            "ms": 1330
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "failed",
            "ms": 2265,
            "message": "Differs from reference by 12.1% (limit 2%)"
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "passed",
            "ms": 30000
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain_dark.jpg",
            "thumb": "screenshots/thumbs/terrain_dark.jpg",
            "status": "failed",
            "diff_pct": 18.4
          },
          {
            "scene": "Water surface",
            "file": "screenshots/water.jpg",
            "thumb": "screenshots/thumbs/water.jpg",
            "status": "passed",
            "diff_pct": 0.35
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.26
          },
          {
            "scene": "Volume slice",
            "file": "screenshots/volume_slice.jpg",
            "thumb": "screenshots/thumbs/volume_slice.jpg",
            "status": "passed",
            "diff_pct": 0.18
          },
          {
            "scene": "Contours",
            "file": "screenshots/contours.jpg",
            "thumb": "screenshots/thumbs/contours.jpg",
            "status": "passed",
            "diff_pct": 0.54
          },
          {
            "scene": "UI overlay",
            "file": "screenshots/ui_overlay_dark.jpg",
            "thumb": "screenshots/thumbs/ui_overlay_dark.jpg",
            "status": "failed",
            "diff_pct": 12.1
          }
        ],
        "stats": {
          "fps_avg": 168.8,
          "frame_ms_p95": 7.31,
          "gpu_mem_mb": 1499,
          "load_ms": 1119
        },
        "duration_sec": 368,
        "finished": "2026-11-02T15:45:08Z"
      },
      "lab-win-02": {
        "status": "failed",
        "started": "2026-11-02T15:25:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800789737",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 196140
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 37360
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 1387
          },
          {
            "name": "Screenshot: Terrain",
            "status": "failed",
            "ms": 1232,
            "message": "Differs from reference by 18.4% (limit 2%)"
          },
          {
            "name": "Screenshot: Water surface",
            "status": "passed",
            "ms": 1262
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 950
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "passed",
            "ms": 1580
          },
          {
            "name": "Screenshot: Contours",
            "status": "passed",
            "ms": 1743
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "failed",
            "ms": 1408,
            "message": "Differs from reference by 12.1% (limit 2%)"
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "passed",
            "ms": 30000
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain_dark.jpg",
            "thumb": "screenshots/thumbs/terrain_dark.jpg",
            "status": "failed",
            "diff_pct": 18.4
          },
          {
            "scene": "Water surface",
            "file": "screenshots/water.jpg",
            "thumb": "screenshots/thumbs/water.jpg",
            "status": "passed",
            "diff_pct": 0.59
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.53
          },
          {
            "scene": "Volume slice",
            "file": "screenshots/volume_slice.jpg",
            "thumb": "screenshots/thumbs/volume_slice.jpg",
            "status": "passed",
            "diff_pct": 0.11
          },
          {
            "scene": "Contours",
            "file": "screenshots/contours.jpg",
            "thumb": "screenshots/thumbs/contours.jpg",
            "status": "passed",
            "diff_pct": 0.47
          },
          {
            "scene": "UI overlay",
            "file": "screenshots/ui_overlay_dark.jpg",
            "thumb": "screenshots/thumbs/ui_overlay_dark.jpg",
            "status": "failed",
            "diff_pct": 12.1
          }
        ],
        "stats": {
          "fps_avg": 125.3,
          "frame_ms_p95": 10.24,
          "gpu_mem_mb": 1386,
          "load_ms": 1387
        },
        "duration_sec": 467,
        "finished": "2026-11-02T15:32:47Z"
      }
    },
    "4be81a0b552996ca1bb227e240260af6cfcd3f56": {
      "lab-win-01": {
        "status": "passed",
        "started": "2026-11-02T22:30:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800811603",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 154980
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 29520
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 1125
          },
          {
            "name": "Screenshot: Terrain",
            "status": "passed",
            "ms": 1842
          },
          {
            "name": "Screenshot: Water surface",
            "status": "passed",
            "ms": 1366
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 2251
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "passed",
            "ms": 1572
          },
          {
            "name": "Screenshot: Contours",
            "status": "passed",
            "ms": 1042
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "passed",
            "ms": 1471
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "passed",
            "ms": 30000
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain.jpg",
            "thumb": "screenshots/thumbs/terrain.jpg",
            "status": "passed",
            "diff_pct": 0.49
          },
          {
            "scene": "Water surface",
            "file": "screenshots/water.jpg",
            "thumb": "screenshots/thumbs/water.jpg",
            "status": "passed",
            "diff_pct": 0.21
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.13
          },
          {
            "scene": "Volume slice",
            "file": "screenshots/volume_slice.jpg",
            "thumb": "screenshots/thumbs/volume_slice.jpg",
            "status": "passed",
            "diff_pct": 0.12
          },
          {
            "scene": "Contours",
            "file": "screenshots/contours.jpg",
            "thumb": "screenshots/thumbs/contours.jpg",
            "status": "passed",
            "diff_pct": 0.17
          },
          {
            "scene": "UI overlay",
            "file": "screenshots/ui_overlay.jpg",
            "thumb": "screenshots/thumbs/ui_overlay.jpg",
            "status": "passed",
            "diff_pct": 0.58
          }
        ],
        "stats": {
          "fps_avg": 169.9,
          "frame_ms_p95": 7.31,
          "gpu_mem_mb": 1496,
          "load_ms": 1125
        },
        "duration_sec": 369,
        "finished": "2026-11-02T22:36:09Z"
      },
      "lab-win-02": {
        "status": "passed",
        "started": "2026-11-02T22:33:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800896683",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 195300
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 37200
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 1375
          },
          {
            "name": "Screenshot: Terrain",
            "status": "passed",
            "ms": 1434
          },
          {
            "name": "Screenshot: Water surface",
            "status": "passed",
            "ms": 1443
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 2121
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "passed",
            "ms": 2392
          },
          {
            "name": "Screenshot: Contours",
            "status": "passed",
            "ms": 1793
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "passed",
            "ms": 1947
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "passed",
            "ms": 30000
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain.jpg",
            "thumb": "screenshots/thumbs/terrain.jpg",
            "status": "passed",
            "diff_pct": 0.53
          },
          {
            "scene": "Water surface",
            "file": "screenshots/water.jpg",
            "thumb": "screenshots/thumbs/water.jpg",
            "status": "passed",
            "diff_pct": 0.11
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.02
          },
          {
            "scene": "Volume slice",
            "file": "screenshots/volume_slice.jpg",
            "thumb": "screenshots/thumbs/volume_slice.jpg",
            "status": "passed",
            "diff_pct": 0.26
          },
          {
            "scene": "Contours",
            "file": "screenshots/contours.jpg",
            "thumb": "screenshots/thumbs/contours.jpg",
            "status": "passed",
            "diff_pct": 0.47
          },
          {
            "scene": "UI overlay",
            "file": "screenshots/ui_overlay.jpg",
            "thumb": "screenshots/thumbs/ui_overlay.jpg",
            "status": "passed",
            "diff_pct": 0.36
          }
        ],
        "stats": {
          "fps_avg": 124.3,
          "frame_ms_p95": 10.18,
          "gpu_mem_mb": 1404,
          "load_ms": 1375
        },
        "duration_sec": 465,
        "finished": "2026-11-02T22:40:45Z"
      },
      "lab-win-03": {
        "status": "passed",
        "started": "2026-11-02T22:25:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800948171",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 297360
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 56640
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 2337
          },
          {
            "name": "Screenshot: Terrain",
            "status": "passed",
            "ms": 2306
          },
          {
            "name": "Screenshot: Water surface",
            "status": "passed",
            "ms": 2273
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 1783
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "passed",
            "ms": 2260
          },
          {
            "name": "Screenshot: Contours",
            "status": "passed",
            "ms": 2176
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "passed",
            "ms": 1155
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "passed",
            "ms": 30000
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain.jpg",
            "thumb": "screenshots/thumbs/terrain.jpg",
            "status": "passed",
            "diff_pct": 0.48
          },
          {
            "scene": "Water surface",
            "file": "screenshots/water.jpg",
            "thumb": "screenshots/thumbs/water.jpg",
            "status": "passed",
            "diff_pct": 0.43
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.12
          },
          {
            "scene": "Volume slice",
            "file": "screenshots/volume_slice.jpg",
            "thumb": "screenshots/thumbs/volume_slice.jpg",
            "status": "passed",
            "diff_pct": 0.04
          },
          {
            "scene": "Contours",
            "file": "screenshots/contours.jpg",
            "thumb": "screenshots/thumbs/contours.jpg",
            "status": "passed",
            "diff_pct": 0.55
          },
          {
            "scene": "UI overlay",
            "file": "screenshots/ui_overlay.jpg",
            "thumb": "screenshots/thumbs/ui_overlay.jpg",
            "status": "passed",
            "diff_pct": 0.19
          }
        ],
        "stats": {
          "fps_avg": 65.5,
          "frame_ms_p95": 19.1,
          "gpu_mem_mb": 1193,
          "load_ms": 2337
        },
        "duration_sec": 708,
        "finished": "2026-11-02T22:36:48Z"
      }
    },
    "9f3c2e1e0b870f9de98a151041a8002a6834b887": {
      "lab-win-01": {
        "status": "running",
        "started": "2026-11-03T17:58:00Z",
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18800988534",
        "tests": [
          {
            "name": "Build (Release)",
            "status": "passed",
            "ms": 156240
          },
          {
            "name": "Unit tests",
            "status": "passed",
            "ms": 29760
          },
          {
            "name": "Load test scenes",
            "status": "passed",
            "ms": 1120
          },
          {
            "name": "Screenshot: Terrain",
            "status": "passed",
            "ms": 2261
          },
          {
            "name": "Screenshot: Water surface",
            "status": "passed",
            "ms": 2287
          },
          {
            "name": "Screenshot: Point cloud",
            "status": "passed",
            "ms": 1256
          },
          {
            "name": "Screenshot: Volume slice",
            "status": "pending"
          },
          {
            "name": "Screenshot: Contours",
            "status": "pending"
          },
          {
            "name": "Screenshot: UI overlay",
            "status": "pending"
          },
          {
            "name": "Performance budget (p95 < 33 ms)",
            "status": "pending"
          }
        ],
        "screenshots": [
          {
            "scene": "Terrain",
            "file": "screenshots/terrain.jpg",
            "thumb": "screenshots/thumbs/terrain.jpg",
            "status": "passed",
            "diff_pct": 0.12
          },
          {
            "scene": "Water surface",
            "file": "screenshots/water_fade.jpg",
            "thumb": "screenshots/thumbs/water_fade.jpg",
            "status": "passed",
            "diff_pct": 1.4
          },
          {
            "scene": "Point cloud",
            "file": "screenshots/point_cloud.jpg",
            "thumb": "screenshots/thumbs/point_cloud.jpg",
            "status": "passed",
            "diff_pct": 0.45
          }
        ],
        "stats": null,
        "finished": null,
        "duration_sec": null
      },
      "lab-win-02": {
        "status": "queued",
        "started": null,
        "run_url": "https://github.com/your-user/your-private-repo/actions/runs/18801065553",
        "tests": [],
        "screenshots": []
      }
    }
  }
};
