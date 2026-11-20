// Autor: MMSZ (Mario Soto Zea)
// Temas de colores de Novexa. Los colores reales están en styles.css ([data-tema="..."]);
// aquí solo va la información para mostrar el selector en Configuración.

export interface MmszTema {
  id: string;
  nombre: string;
  descripcion: string;
  muestra: [string, string, string]; // fondo, suave, color principal (para la vista previa)
}

export const MMSZ_TEMAS: MmszTema[] = [
  { id: 'clasico', nombre: 'Clásico', descripcion: 'Blanco con morado Novexa', muestra: ['#ffffff', '#f5f4f8', '#7a5af8'] },
  { id: 'menta', nombre: 'Menta', descripcion: 'Fresco y tranquilo para estudiar', muestra: ['#ffffff', '#eef8f4', '#1f9d74'] },
  { id: 'atardecer', nombre: 'Atardecer', descripcion: 'Cálido, con naranja coral', muestra: ['#fffdfb', '#fdf2ec', '#e8613f'] },
  { id: 'cereza', nombre: 'Cereza', descripcion: 'Rosa intenso y moderno', muestra: ['#fffcfd', '#fcf0f4', '#d23a6f'] },
  { id: 'arena', nombre: 'Arena', descripcion: 'Tonos suaves tipo papel, cansa menos la vista', muestra: ['#fbf8f2', '#f2ece0', '#a0682a'] },
  { id: 'nocturno', nombre: 'Nocturno', descripcion: 'Modo oscuro para estudiar de noche', muestra: ['#16151f', '#262435', '#9b82ff'] },
  { id: 'terminal', nombre: 'Terminal', descripcion: 'Oscuro con verde, estilo programador', muestra: ['#0f1512', '#1a2420', '#3ddc84'] },
];
