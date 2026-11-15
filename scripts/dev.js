const { spawn } = require('child_process');
const path = require('path');

const raiz = path.join(__dirname, '..');
const procesos = [];
let cerrando = false;

function lanzar(nombre, args, carpeta) {
  const proceso = spawn('npm', args, { cwd: carpeta, stdio: 'inherit', shell: true });

  proceso.on('exit', (codigo) => {
    if (cerrando) return;
    console.log(`[${nombre}] terminó con código ${codigo}. Cerrando el resto…`);
    detener();
  });

  procesos.push(proceso);
}

function detener() {
  if (cerrando) return;
  cerrando = true;
  procesos.forEach((proceso) => proceso.kill());
  process.exit();
}

process.on('SIGINT', detener);
process.on('SIGTERM', detener);

lanzar('api', ['run', 'dev'], path.join(raiz, 'Backend'));
lanzar('web', ['start'], path.join(raiz, 'Frontend'));
