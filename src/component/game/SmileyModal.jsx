import { X } from "lucide-react"

export default function SmileyModal({ isOpen=false, onClose, onSelect }) {
  const smileys = [
    '/smileys/Angry Fight Sticker.gif',
    '/smileys/Crazy Eyes Flirting Sticker by Emoji.gif',
    '/smileys/Ha Ha Smile Sticker by Emoji.gif',
    '/smileys/Happy Fun Sticker.gif',
    '/smileys/Home Alone Wow Sticker by Emoji.gif',
    '/smileys/Oh No Omg Sticker by Emoji.gif',
    '/smileys/Sad 3D Sticker by Emoji.gif',
    '/smileys/Shocked No Way Sticker by Emoji.gif',
    '/smileys/Standing Ovation Applause Sticker by Emoji.gif',
  ]
  return (
    <>
      {isOpen && (
        <div
          style={{
            zIndex: 9999,
            position: 'fixed',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div>
            <div style={{
              width: '160pt',
              height: '24pt',
              paddingRight: '4pt',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'end',
              backdropFilter: 'blur(15px)'
            }}>
              <div style={{ display: 'flex', border: '2px solid', borderRadius: '24pt' }} onClick={onClose}>
                <X size={20} />
              </div>
            </div>
            <div style={{
              width: '160pt',
              height: '160pt',
              display: 'flex',
              alignItems: 'start',
              flexWrap: 'wrap',
              backdropFilter: 'blur(15px)'
            }}>
              {smileys.map((smiley, idx) => {
                return (
                  <div
                    key={idx}
                    style={{
                      width: 'calc(100% / 3)',
                      height: 'calc(100% / 3)',
                      padding: '8pt',
                      cursor: 'pointer',
                    }}
                    onClick={() => onSelect(smiley)}
                  >
                    <img src={smiley} alt="Haha" style={{
                      width: '100%',
                      borderRadius: '4pt'
                    }} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}