# 🚀 Guía de Deployment - HabilixUp

## 📋 Checklist Pre-Deployment

### ✅ Configuración de Base de Datos
1. **Ejecutar script SQL**: Aplicar `database-fixed.sql` en Supabase
2. **Verificar tablas**: Confirmar que todas las tablas están creadas
3. **Configurar RLS**: Verificar que las políticas de seguridad están activas
4. **Datos iniciales**: Confirmar que las categorías están insertadas

### ✅ Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Configurar variables requeridas
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### ✅ Dependencias
```bash
# Instalar dependencias
npm install

# Verificar que no hay vulnerabilidades
npm audit

# Actualizar dependencias críticas si es necesario
npm update
```

## 🌐 Deployment en Vercel (Recomendado)

### 1. Preparación
```bash
# Build local para verificar
npm run build
npm run start

# Verificar que funciona correctamente
curl http://localhost:3000/api/health
```

### 2. Configuración en Vercel
1. Conectar repositorio de GitHub
2. Configurar variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`

### 3. Deploy
```bash
# Usando Vercel CLI
npx vercel --prod

# O push a main branch para auto-deploy
git push origin main
```

## 🐳 Deployment con Docker

### 1. Crear Dockerfile
```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
USER nextjs
EXPOSE 3000
CMD ["npm", "start"]
```

### 2. Build y Run
```bash
# Build imagen
docker build -t habilixup .

# Run container
docker run -p 3000:3000 --env-file .env.local habilixup
```

## ☁️ Deployment en Netlify

### 1. Configuración
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. Variables de entorno
Configurar en Netlify Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

## 🔧 Configuración Post-Deployment

### 1. Verificar Health Check
```bash
curl https://your-domain.com/api/health
```

Respuesta esperada:
```json
{
  "status": "healthy",
  "message": "HabilixUp API is running correctly",
  "database": "connected",
  "features": {
    "studyTime": "enabled",
    "profileVerification": "enabled",
    "pdfGeneration": "enabled",
    "notifications": "enabled"
  }
}
```

### 2. Configurar Dominio Personalizado
1. Configurar DNS records
2. Configurar SSL/TLS
3. Actualizar `NEXT_PUBLIC_SITE_URL`

### 3. Configurar Monitoreo
- Configurar alertas de uptime
- Configurar logs de error
- Configurar métricas de performance

## 🔒 Configuración de Seguridad

### 1. Headers de Seguridad
Ya configurados en `next.config.js`:
- X-Frame-Options
- X-Content-Type-Options
- Content-Security-Policy
- Referrer-Policy

### 2. Supabase Security
- Verificar RLS policies
- Configurar rate limiting
- Revisar permisos de API keys

### 3. HTTPS
- Forzar HTTPS en producción
- Configurar HSTS headers
- Verificar certificados SSL

## 📊 Monitoreo y Logs

### 1. Health Checks
```bash
# Verificar estado cada 5 minutos
*/5 * * * * curl -f https://your-domain.com/api/health || echo "Health check failed"
```

### 2. Error Tracking
Configurar servicio como:
- Sentry
- LogRocket
- Bugsnag

### 3. Analytics
- Google Analytics
- Vercel Analytics
- Custom metrics

## 🚨 Troubleshooting

### Errores Comunes

#### 1. "Error al cambiar la visibilidad del CV"
- Verificar conexión a Supabase
- Verificar RLS policies en tabla `profiles`
- Verificar que el usuario está autenticado

#### 2. "Tiempo de estudio no se calcula"
- Verificar datos en tabla `lesson_progress`
- Verificar que hay enrollments activos
- Verificar función `getUserStudyTime`

#### 3. "URLs de verificación no funcionan"
- Verificar que `verification_code` está en la base de datos
- Verificar rutas dinámicas `/cv/[code]` y `/perfil/[code]`
- Verificar que `is_public` está en `true`

### Logs Útiles
```bash
# Ver logs en Vercel
vercel logs your-deployment-url

# Ver logs locales
npm run dev

# Health check detallado
curl -v https://your-domain.com/api/health
```

## 📈 Optimizaciones Post-Deployment

### 1. Performance
- Configurar CDN
- Optimizar imágenes
- Implementar caching
- Minificar assets

### 2. SEO
- Configurar meta tags
- Implementar sitemap
- Configurar robots.txt
- Optimizar Core Web Vitals

### 3. User Experience
- Implementar PWA
- Configurar offline mode
- Optimizar tiempo de carga
- Implementar lazy loading

## ✅ Checklist Final

- [ ] Base de datos configurada y funcionando
- [ ] Variables de entorno configuradas
- [ ] Build exitoso sin errores
- [ ] Health check responde correctamente
- [ ] Autenticación funciona
- [ ] Dashboard muestra datos reales
- [ ] Sistema de verificación funciona
- [ ] PDFs se generan correctamente
- [ ] Notificaciones funcionan
- [ ] URLs públicas accesibles
- [ ] HTTPS configurado
- [ ] Dominio personalizado configurado
- [ ] Monitoreo configurado
- [ ] Backup de base de datos configurado

## 📞 Soporte

Para problemas de deployment:
1. Verificar logs de error
2. Revisar configuración de variables de entorno
3. Verificar estado de Supabase
4. Contactar soporte técnico si es necesario

---

*Última actualización: 2025-01-20*
