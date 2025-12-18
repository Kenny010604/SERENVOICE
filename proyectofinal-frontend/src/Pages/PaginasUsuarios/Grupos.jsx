import React, { useEffect, useState, useCallback, useContext } from 'react';
import groupsService from '../../services/groupsService';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import authService from '../../services/authService';
import NavbarUsuario from '../../components/Usuario/NavbarUsuario';
import '../../global.css';
import { ThemeContext } from '../../context/themeContextDef';
import FondoClaro from '../../assets/FondoClaro.svg';
import FondoOscuro from '../../assets/FondoOscuro.svg';

export default function Grupos() {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useContext(ThemeContext);
  const userData = authService.getUser();

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await groupsService.listar();
      const all = data || [];
      console.log('[Grupos] respuesta listar():', all);

      // If query param owner=me, show all groups where user is member or facilitator
      const params = new URLSearchParams(location.search);
      if (params.get('owner') === 'me') {
        // El endpoint /api/grupos ya devuelve solo los grupos donde el usuario es miembro
        // Así que simplemente usamos todos los datos
        setGrupos(all);
      } else {
        // Para buscar grupos, solo mostrar públicos
        setGrupos(all.filter(g => g.privacidad === 'publico'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [location.search]);

  useEffect(() => { cargar(); }, [cargar]);

  // Lista ya filtrada según búsqueda (se reutiliza en el render)
  const filteredGrupos = grupos.filter(g => {
    if (!query) return true;
    const nombre = (g.nombre || g.name || g.nombre_grupo || '').toString().toLowerCase();
    const desc = (g.descripcion || g.description || '').toString().toLowerCase();
    return nombre.includes(query.toLowerCase()) || desc.includes(query.toLowerCase());
  });

  const params = new URLSearchParams(location.search);
  const showingMyGroups = params.get('owner') === 'me';

  const eliminar = async (id) => {
    if (!confirm('Eliminar grupo?')) return;
    try {
      await groupsService.eliminar(id);
      cargar();
    } catch (e) { console.error(e); }
  };

  if (!userData) return <Navigate to="/login" replace />;

  return (
    <>
      <NavbarUsuario userData={userData} />

      <main
        className="container"
        style={{
          paddingTop: '2rem',
          paddingBottom: '4rem',
          backgroundImage: `url(${isDark ? FondoOscuro : FondoClaro})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          minHeight: '100vh'
        }}
      >
        <div className="card" style={{maxWidth: '1200px', margin: '0 auto'}}>
          <h2 style={{marginTop:0,color:'var(--color-text-main)'}}>{showingMyGroups ? 'Mis Grupos' : 'Explorar Grupos'}</h2>
          
          <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:'1.5rem',flexWrap:'wrap'}}>
            {showingMyGroups ? (
              <>
                <button onClick={() => navigate('/grupos/nuevo')} className="auth-button">Crear Grupo</button>
                <button onClick={() => navigate('/grupos')} className="auth-button" style={{background:'var(--color-panel-solid)'}}>Ver Todos los Grupos</button>
                <input 
                  placeholder="Buscar en mis grupos..." 
                  value={query} 
                  onChange={e=>setQuery(e.target.value)} 
                  style={{flex:1,minWidth:'200px',padding:'0.5rem',borderRadius:'8px',border:'1px solid var(--color-shadow)',background:'var(--color-panel)',color:'var(--color-text-main)'}} 
                />
              </>
            ) : (
              <>
                <button onClick={() => navigate('/grupos/nuevo')} className="auth-button">Crear Grupo</button>
                <button onClick={() => navigate('/grupos?owner=me')} className="auth-button" style={{background:'var(--color-panel-solid)'}}>Mis Grupos</button>
                <input 
                  placeholder="Buscar grupos..." 
                  value={query} 
                  onChange={e=>setQuery(e.target.value)} 
                  style={{flex:1,minWidth:'200px',padding:'0.5rem',borderRadius:'8px',border:'1px solid var(--color-shadow)',background:'var(--color-panel)',color:'var(--color-text-main)'}} 
                />
              </>
            )}
          </div>

          {loading ? (
            <div style={{textAlign:'center',padding:'2rem',color:'var(--color-text-secondary)'}}>Cargando...</div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1rem'}}>
              {filteredGrupos.map(g => {
              const gid = g.id || g._id || g.id_grupo;
              const name = g.nombre || g.name || g.nombre_grupo || 'Grupo sin nombre';
              const desc = g.descripcion || g.description || '';
              const tipo = g.tipo || g.type || g.tipo_grupo || 'General';
              const maxP = g.max_participantes || g.maxParticipantes || g.max || g.capacidad || g.max_participants || '—';
              const rolGrupo = g.rol_grupo || g.role || 'miembro';
              const userId = userData?.id_usuario || userData?.id;
              const esFacilitador = g.id_facilitador === userId;
              
              return (
                <div key={gid} className="card" style={{
                  padding:'1rem',
                  display:'flex',
                  flexDirection:'column',
                  gap:'0.75rem',
                  background:'var(--color-panel)',
                  border:'1px solid var(--color-shadow)',
                  transition:'transform 0.2s, box-shadow 0.2s',
                  cursor:'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px var(--color-shadow)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
                >
                  <div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:'0.5rem'}}>
                      <h3 style={{margin:0,color:'var(--color-text-main)',fontSize:'1.1rem'}}>{name}</h3>
                      {showingMyGroups && (
                        <span style={{
                          fontSize:'0.7rem',
                          padding:'3px 10px',
                          borderRadius:'12px',
                          background: esFacilitador ? 'var(--color-primary)' : 'var(--color-panel-solid)',
                          color: esFacilitador ? 'white' : 'var(--color-text-main)',
                          fontWeight:'600',
                          whiteSpace:'nowrap'
                        }}>
                          {esFacilitador ? 'Facilitador' : rolGrupo}
                        </span>
                      )}
                    </div>
                    <p style={{margin:'0',color:'var(--color-text-secondary)',fontSize:'0.9rem',lineHeight:'1.4'}}>{desc || 'Sin descripción'}</p>
                  </div>

                  <div style={{display:'flex',gap:'1rem',flexWrap:'wrap',fontSize:'0.85rem'}}>
                    <div style={{flex:'1 1 45%'}}>
                      <strong style={{color:'var(--color-text-main)'}}>Tipo:</strong>{' '}
                      <span style={{color:'var(--color-text-secondary)'}}>{tipo}</span>
                    </div>
                    <div style={{flex:'1 1 45%'}}>
                      <strong style={{color:'var(--color-text-main)'}}>Max:</strong>{' '}
                      <span style={{color:'var(--color-text-secondary)'}}>{maxP}</span>
                    </div>
                  </div>

                  <div style={{display:'flex',gap:'0.5rem',marginTop:'auto'}}>
                    <Link 
                      to={`/grupos/${gid}`} 
                      className="auth-button" 
                      style={{padding:'0.5rem 1rem',borderRadius:'8px',flex:1,textAlign:'center',textDecoration:'none'}}
                    >
                      Ver Detalles
                    </Link>
                    {esFacilitador && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          eliminar(gid);
                        }} 
                        className="auth-button danger" 
                        style={{padding:'0.5rem 1rem',borderRadius:'8px'}}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredGrupos.length === 0 && (
              <div style={{
                gridColumn:'1/-1',
                textAlign:'center',
                padding:'3rem 1rem',
                color:'var(--color-text-secondary)',
                background:'var(--color-panel)',
                borderRadius:'12px',
                border:'1px dashed var(--color-shadow)'
              }}>
                {showingMyGroups ? '¡No tienes grupos todavía! Crea uno o únete a alguno.' : 'No hay grupos públicos disponibles.'}
              </div>
            )}
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} SerenVoice — Todos los derechos reservados.
      </footer>
    </>
  );
}
