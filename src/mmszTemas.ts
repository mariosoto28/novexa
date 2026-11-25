export interface MmszTema {
  mmszId: string;
  mmszNombre: string;
  mmszDescripcion: string;
  mmszMuestra: [string, string, string];
}

export const MMSZ_TEMAS: MmszTema[] = [
  { mmszId: 'clasico', mmszNombre: 'Clásico', mmszDescripcion: 'Blanco con morado Novexa', mmszMuestra: ['#ffffff', '#f5f4f8', '#7a5af8'] },
  { mmszId: 'menta', mmszNombre: 'Menta', mmszDescripcion: 'Fresco y tranquilo para estudiar', mmszMuestra: ['#ffffff', '#eef8f4', '#1f9d74'] },
  { mmszId: 'atardecer', mmszNombre: 'Atardecer', mmszDescripcion: 'Cálido, con naranja coral', mmszMuestra: ['#fffdfb', '#fdf2ec', '#e8613f'] },
  { mmszId: 'cereza', mmszNombre: 'Cereza', mmszDescripcion: 'Rosa intenso y moderno', mmszMuestra: ['#fffcfd', '#fcf0f4', '#d23a6f'] },
  { mmszId: 'arena', mmszNombre: 'Arena', mmszDescripcion: 'Tonos suaves tipo papel, cansa menos la vista', mmszMuestra: ['#fbf8f2', '#f2ece0', '#a0682a'] },
  { mmszId: 'nocturno', mmszNombre: 'Nocturno', mmszDescripcion: 'Modo oscuro para estudiar de noche', mmszMuestra: ['#16151f', '#262435', '#9b82ff'] },
  { mmszId: 'terminal', mmszNombre: 'Terminal', mmszDescripcion: 'Oscuro con verde, estilo programador', mmszMuestra: ['#0f1512', '#1a2420', '#3ddc84'] },
];
