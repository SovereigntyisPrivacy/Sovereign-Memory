import { useState, useEffect } from 'react';
import { Phone, Plus, Trash2, ArrowLeft, Camera, User } from 'lucide-react';

export default function FamilyDirectory() {
  const [contacts, setContacts] = useState([]);
  const [view, setView] = useState('list');
  const [newContact, setNewContact] = useState({ name: '', relationship: '', phone: '', photo: '' });

  useEffect(() => {
    const saved = localStorage.getItem('sovereign_contacts');
    if (saved) setContacts(JSON.parse(saved));
  }, []);

  const saveContacts = (updated) => {
    localStorage.setItem('sovereign_contacts', JSON.stringify(updated));
    setContacts(updated);
  };

  const deleteContact = (id) => {
    const updated = contacts.filter(c => c.id !== id);
    saveContacts(updated);
  };

  // Converts the chosen image into an offline-friendly format
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewContact({ ...newContact, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  if (view === 'add') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button onClick={() => setView('list')} style={{ width: 'auto', padding: '12px 24px', backgroundColor: '#333' }}>
            <ArrowLeft size={28} /> Cancel
          </button>
          <h2>Add Contact</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1, overflowY: 'auto' }}>
          
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '250px', backgroundColor: '#222', border: '4px dashed #555', borderRadius: '24px', cursor: 'pointer', overflow: 'hidden' }}>
            {newContact.photo ? (
              <img src={newContact.photo} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <>
                <Camera size={64} color="var(--accent)" style={{ marginBottom: '16px' }} />
                <span style={{ fontSize: '24px', color: 'var(--text-muted)' }}>Tap to add photo</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          </label>

          <input 
            type="text" placeholder="Name (e.g., Will)" 
            value={newContact.name} onChange={(e) => setNewContact({...newContact, name: e.target.value})}
            style={{ padding: '24px', fontSize: '24px', borderRadius: '16px', backgroundColor: 'var(--surface)', color: '#FFF', border: '2px solid #555' }}
          />
          <input 
            type="text" placeholder="Relationship (e.g., Friend of 5 years)" 
            value={newContact.relationship} onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
            style={{ padding: '24px', fontSize: '24px', borderRadius: '16px', backgroundColor: 'var(--surface)', color: '#FFF', border: '2px solid #555' }}
          />
          <input 
            type="tel" placeholder="Phone Number" 
            value={newContact.phone} onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
            style={{ padding: '24px', fontSize: '24px', borderRadius: '16px', backgroundColor: 'var(--surface)', color: '#FFF', border: '2px solid #555' }}
          />

          <button 
            className="primary-btn"
            onClick={() => {
              if (newContact.name && newContact.phone) {
                saveContacts([...contacts, { ...newContact, id: Date.now() }]);
                setNewContact({ name: '', relationship: '', phone: '', photo: '' });
                setView('list');
              }
            }}
            style={{ marginTop: 'auto', padding: '24px', justifyContent: 'center' }}
          >
            Save Contact
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px' }}>
      <button className="primary-btn" onClick={() => setView('add')} style={{ marginBottom: '24px', justifyContent: 'center' }}>
        <Plus size={28} /> Add New Contact
      </button>

      {contacts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '20px' }}>
          No contacts added yet. Tap above to add family and friends.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
          {contacts.map((contact) => (
            <div key={contact.id} style={{ backgroundColor: 'var(--surface)', border: '4px solid #444', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              
              {contact.photo ? (
                <img src={contact.photo} alt={contact.name} style={{ width: '100%', height: '350px', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '250px', backgroundColor: '#222', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <User size={80} color="#555" />
                </div>
              )}

              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '40px', color: 'var(--accent)', margin: '0 0 8px 0' }}>{contact.name}</h2>
                    <p style={{ fontSize: '24px', color: 'var(--text-muted)', margin: 0 }}>{contact.relationship}</p>
                  </div>
                  <button onClick={() => deleteContact(contact.id)} style={{ padding: '12px', backgroundColor: 'transparent', border: 'none' }}>
                    <Trash2 size={32} color="var(--error)" />
                  </button>
                </div>

                <a 
                  href={`tel:${contact.phone}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', backgroundColor: '#2E7D32', color: '#FFF', textDecoration: 'none', padding: '24px', borderRadius: '16px', fontSize: '32px', fontWeight: 'bold' }}
                >
                  <Phone size={36} /> CALL NOW
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
