# Prueba de instalación limpia

Estado: **pendiente de ejecutar en una PC o VM limpia de Windows 10/11 x64**. No se afirma como completada desde el equipo de desarrollo.

1. Verificar que la PC no tenga .NET, Node.js, Docker ni PostgreSQL.
2. Descargar `HorasPay-Setup-x.y.z.exe` desde la página de descarga.
3. Instalar sin privilegios de administrador y confirmar accesos directo y de Inicio.
4. Completar la bienvenida, crear una jornada `08:00-17:30`, descanso `60`, tarifa `200`, multiplicador `1.5`; comprobar `8 normales`, `0.5 extra`, `RD$ 1,750.00`.
5. Cerrar, volver a abrir y comprobar persistencia sin internet.
6. Exportar respaldo, importarlo en otra instalación, y comparar las jornadas.
7. Probar actualización desde un release posterior y comprobar que no borra datos.
8. Desinstalar una vez conservando los datos y una segunda vez eliminándolos, documentando el resultado.
