# 🚀 COMANDOS DE HABILIXUP

## 📋 **DESARROLLO (Recomendado para trabajar)**
```bash
npm run dev
```
- ✅ Hot reload automático
- ✅ Cambios en tiempo real
- ⚠️ Puede requerir recargas ocasionales (normal)

## 🏗️ **PRODUCCIÓN (Para testing final)**
```bash
# Paso 1: Construir la aplicación
npm run build

# Paso 2: Iniciar en modo producción
npm start
```
- ✅ Más rápido
- ✅ Optimizado para producción
- ❌ Sin hot reload

## 🔧 **OTROS COMANDOS ÚTILES**
```bash
# Verificar errores de TypeScript
npx tsc --noEmit

# Verificar linting
npm run lint

# Limpiar caché (si hay problemas)
rm -rf .next
npm run dev
```

## 🐛 **SI HAY PROBLEMAS EN DESARROLLO:**

### Opción 1: Recarga simple
- Presiona `F5` en el navegador

### Opción 2: Limpiar caché
```bash
# Detener servidor (Ctrl+C)
rm -rf .next
npm run dev
```

### Opción 3: Reinicio completo
```bash
# Detener servidor (Ctrl+C)
rm -rf .next node_modules
npm install
npm run dev
```

## ✅ **ESTADO ACTUAL:**
- ✅ Panel de admin funcionando
- ✅ Autenticación persistente
- ✅ Build de producción funcional
- ⚠️ Recargas ocasionales en dev (normal)
