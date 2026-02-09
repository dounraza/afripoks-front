import { useContext, useState } from "react"
import { JoinedTableContext } from "../../contexts/JoinedTableContext"
import { useNavigate, useParams } from "react-router-dom";
import { getById } from "../../services/tableServices";
import { Dices, X } from "lucide-react";

export default function TableTabs() {
  const { joinedTables } = useContext(JoinedTableContext);
  const params = useParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const verifyCave = async (id) => {
    const caveMin = await getById(id);

    navigate(`/game/${id}`, {
      state: { cave: caveMin },
      replace: true,
    });
  };
  console.log('Table id', params.tableid);

  return (
    <>
      <div 
          className=""
          style={{
              color: 'white',
              cursor: 'pointer',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              paddingTop: 4,
              paddingBottom: 4,
              border: '2px solid white',
          }}
          onClick={() => setIsOpen(true)}
      >
          <Dices size={20} />
          {/* <span>Historique</span> */}
      </div>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(5px)',
        }}>
          <div style={{ width: '100%' }}>
            <div style={{
              width: '80%',
              marginLeft: 'auto',
              marginRight: 'auto',
              backgroundColor: '#222',
              color: 'white',
              padding: '8pt 8pt 0 8pt',
              borderRadius: '8pt 8pt 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: '4pt',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                fontWeight: 'bold',
              }}>
                <Dices size={20} style={{ marginRight: '8pt' }} /> Mes jeux en cours
              </div>
              <div onClick={() => setIsOpen(false)} style={{ cursor: 'pointer' }}>
                <X />
              </div>
            </div>

            <div style={{
              width: '80%',
              backgroundColor: '#222',
              marginLeft: 'auto',
              marginRight: 'auto',
              color: 'white',
              padding: '2pt 0',
              borderRadius: '0 0 8pt 8pt',
            }}>
              <div style={{
                height: '124pt'
              }}>
                {joinedTables.map((jt, idx) => {
                  return (
                    <div key={idx} 
                      style={{
                        padding: '8pt 8pt',
                        cursor: params.tableid == jt[1].id ? 'default' : 'pointer',
                        color: params.tableid == jt[1].id ? 'black' : 'white',
                        backgroundColor: params.tableid == jt[1].id ? '#FFD700' : 'transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                      onClick={() => {
                        params.tableid != jt[1].id && verifyCave(parseInt(jt[1].id));
                        setIsOpen(false);
                      }}
                    >
                      <span>{jt[1].name}</span>
                      <span>{jt[1].cave} Ar</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}