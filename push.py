import os

os.system('git add "src/app/api/complaints/route.ts" "src/app/student/complaints/page.tsx"')
os.system('git commit -m "Fix Campus Complaint Submission API errors and routing"')

os.system('git add "src/app/student/complaints/new/page.tsx"')
os.system('git commit -m "Add client-side image compression to complaint evidence upload"')

os.system('git push origin HEAD')
