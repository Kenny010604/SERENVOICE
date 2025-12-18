import React from 'react';
import NavbarAdministrador from '../../components/Administrador/NavbarAdministrador';
import ActualizarPerfil from '../../Pages/PaginasUsuarios/ActualizarPerfil.jsx';

export default function PerfilAdmin(){
  return (
    <div>
      <ActualizarPerfil NavbarComponent={NavbarAdministrador} />
    </div>
  );
}
