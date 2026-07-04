#!/usr/bin/env python
"""
UNNATI Project Readiness Check
Run: python scripts/check_readiness.py
"""
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "frontend"

checks = []
score = 0
max_score = 100


def add(name, passed, weight, detail=""):
    global score
    checks.append({"name": name, "passed": passed, "weight": weight, "detail": detail})
    if passed:
        score += weight


def check_backend():
    add("Backend directory exists", BACKEND.exists(), 5)
    req = BACKEND / "requirements.txt"
    add("requirements.txt exists", req.exists(), 5)

    try:
        result = subprocess.run(
            [sys.executable, str(BACKEND / "manage.py"), "check"],
            cwd=BACKEND,
            capture_output=True,
            text=True,
            timeout=60,
        )
        add("Django system check", result.returncode == 0, 15, result.stdout[:200])
    except Exception as e:
        add("Django system check", False, 15, str(e))

    try:
        result = subprocess.run(
            [sys.executable, str(BACKEND / "manage.py"), "showmigrations", "--plan"],
            cwd=BACKEND,
            capture_output=True,
            text=True,
            timeout=60,
        )
        unapplied = "[ ]" in result.stdout
        add("Migrations applied", not unapplied or result.returncode == 0, 10)
    except Exception as e:
        add("Migrations check", False, 10, str(e))

    env_example = ROOT / ".env.example"
    add(".env.example present", env_example.exists(), 5)


def check_frontend():
    add("Frontend directory exists", FRONTEND.exists(), 5)
    pkg = FRONTEND / "package.json"
    add("package.json exists", pkg.exists(), 5)

    env_local = FRONTEND / ".env.local"
    env_example = FRONTEND / ".env.local.example"
    add(
        "Frontend env configured",
        env_local.exists() or env_example.exists(),
        5,
        "Copy .env.local.example to .env.local",
    )

    if (FRONTEND / "node_modules").exists():
        try:
            result = subprocess.run(
                ["npm", "run", "build"],
                cwd=FRONTEND,
                capture_output=True,
                text=True,
                timeout=300,
                shell=True,
            )
            add("Frontend production build", result.returncode == 0, 25, "")
        except Exception as e:
            add("Frontend production build", False, 25, str(e))
    else:
        add("Frontend node_modules", False, 10, "Run npm install in frontend/")


def check_docs():
    audit = ROOT / "AUDIT_REPORT.md"
    readme = ROOT / "README.md"
    add("AUDIT_REPORT.md", audit.exists(), 5)
    add("README.md", readme.exists(), 5)


def main():
    print("=" * 50)
    print("UNNATI Project Readiness Check")
    print("=" * 50)

    check_backend()
    check_frontend()
    check_docs()

    print()
    for c in checks:
        status = "PASS" if c["passed"] else "FAIL"
        print(f"[{status}] {c['name']} ({c['weight']}pts)")
        if c["detail"] and not c["passed"]:
            print(f"       -> {c['detail']}")

    print()
    print(f"Readiness Score: {score}/{max_score}")
    if score >= 90:
        print("Status: PRODUCTION READY")
    elif score >= 75:
        print("Status: VIVA READY")
    elif score >= 60:
        print("Status: NEEDS POLISH")
    else:
        print("Status: NOT READY")

    return 0 if score >= 75 else 1


if __name__ == "__main__":
    sys.exit(main())
