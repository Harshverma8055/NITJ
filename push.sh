#!/bin/bash
git add src/app/api/complaints/route.ts src/app/student/complaints/page.tsx
git commit -m "Fix Campus Complaint Submission API errors and routing"

git add src/app/student/complaints/new/page.tsx
git commit -m "Add client-side image compression to complaint evidence upload"

git push origin HEAD
