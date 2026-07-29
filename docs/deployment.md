# KyuFit Deployment & Operations Guide

## 1. Web Application Deployment (Vercel)

### Prerequisites
- GitHub repository connected to Vercel account
- Supabase PostgreSQL connection strings

### Deployment Steps
1. Import repository on Vercel.
2. Set **Root Directory** to `web`.
3. Set Environment Variables:
   - `DATABASE_URL`: Supabase Transaction Pooler URL
   - `DIRECT_URL`: Supabase Direct Connection URL
   - `JWT_SECRET`: Secret key for session tokens
4. Deploy application.

---

## 2. Gateway & Proxy Management (Standby Laptop 10.70.63.89)

### Service Operations
- **Check OpenClaw Status**:
  ```bash
  systemctl --user status openclaw-gateway.service
  ```
- **Restart OpenClaw Gateway**:
  ```bash
  systemctl --user restart openclaw-gateway.service
  ```
- **Monitor OpenClaw Logs**:
  ```bash
  journalctl --user -u openclaw-gateway.service -f
  ```
- **Check 9Router Status**:
  ```bash
  pm2 status 9router
  ```
- **Restart 9Router Proxy**:
  ```bash
  pm2 restart 9router
  ```

---

## 3. Database Maintenance (Prisma)

### Schema Updates
Run schema migrations from `./web`:
```bash
cd web
npx prisma db push
```
