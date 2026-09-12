import { App as CapApp } from '@capacitor/app';
import { useState, useEffect, useRef } from "react";
import { Home,  ArrowLeft, Phone, User, MapPin, Calendar, Mail, Edit3, Save, Camera, Plus, Trash2, HeartPulse, FileText } from 'lucide-react';

export default function FamilyDirectory({ goHome }) {
  const [profile, setProfile] = useState({ photo: '', name: '', address: '', dob: '', email: '', phone: '', notes: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const [contacts, setContacts] = useState([]);
  const [isEditingContacts, setIsEditingContacts] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('sovereign_owner_profile');
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    
    const savedContacts = localStorage.getItem('sovereign_family_contacts');
    if (savedContacts) setContacts(JSON.parse(savedContacts));
  }, []);

  const saveProfile = (newProfile) => {
    localStorage.setItem('sovereign_owner_profile', JSON.stringify(newProfile));
    setProfile(newProfile);
  };

  const saveContacts = (newContacts) => {
    localStorage.setItem('sovereign_family_contacts', JSON.stringify(newContacts));
    setContacts(newContacts);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        saveProfile({ ...profile, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderProfile = () => {
    if (isEditingProfile) {
      
  useEffect(() => {
    const listener = CapApp.addListener('backButton', () => {
      if (typeof goHome === 'function') goHome();
    });
    return () => { listener.remove(); };
  }, [goHome]);
return (
        <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: '24px', border: '2px solid var(--accent)', marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '20px', textAlign: 'center' }}>Edit My Details</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <div onClick={() => fileInputRef.current.click()} style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#333', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', border: '4px solid var(--accent)', marginBottom: '12px' }}>
              {profile.photo ? <img src={profile.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera size={48} color="#888" />}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Tap circle to change photo</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input value={profile.name} onChange={e => saveProfile({...profile, name: e.target.value})} placeholder="Full Name" style={{ padding: '16px', fontSize: '20px', borderRadius: '12px', backgroundColor: '#222', color: '#FFF', border: '1px solid #555' }} />
            <input value={profile.phone} onChange={e => saveProfile({...profile, phone: e.target.value})} placeholder="Phone Number" style={{ padding: '16px', fontSize: '20px', borderRadius: '12px', backgroundColor: '#222', color: '#FFF', border: '1px solid #555' }} />
            <input value={profile.dob} onChange={e => saveProfile({...profile, dob: e.target.value})} placeholder="Date of Birth (MM/DD/YYYY)" style={{ padding: '16px', fontSize: '20px', borderRadius: '12px', backgroundColor: '#222', color: '#FFF', border: '1px solid #555' }} />
            <input value={profile.email} onChange={e => saveProfile({...profile, email: e.target.value})} placeholder="Email Address" style={{ padding: '16px', fontSize: '20px', borderRadius: '12px', backgroundColor: '#222', color: '#FFF', border: '1px solid #555' }} />
            <textarea value={profile.address} onChange={e => saveProfile({...profile, address: e.target.value})} placeholder="Home Address" style={{ padding: '16px', fontSize: '20px', borderRadius: '12px', backgroundColor: '#222', color: '#FFF', border: '1px solid #555', minHeight: '80px', resize: 'none' }} />
            <textarea value={profile.notes} onChange={e => saveProfile({...profile, notes: e.target.value})} placeholder="Medical Notes, Allergies, or ICE Info..." style={{ padding: '16px', fontSize: '20px', borderRadius: '12px', backgroundColor: '#222', color: '#FFF', border: '1px solid #555', minHeight: '120px', resize: 'none' }} />
          </div>

          <button onClick={() => setIsEditingProfile(false)} style={{ width: '100%', marginTop: '24px', backgroundColor: 'var(--accent)', color: '#000', padding: '16px', borderRadius: '16px', fontSize: '22px', fontWeight: 'bold', border: 'none', display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Save size={28} /> Save Details
          </button>
        </div>
      );
    }

    return (
      <div style={{ backgroundColor: 'rgba(255, 149, 0, 0.05)', padding: '24px', borderRadius: '24px', border: '2px solid var(--accent)', marginBottom: '32px', position: 'relative' }}>
        <button onClick={() => setIsEditingProfile(true)} style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'transparent', border: 'none', color: 'var(--accent)' }}>
          <Edit3 size={28} />
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#333', border: '3px solid var(--accent)', overflow: 'hidden', flexShrink: 0 }}>
             {profile.photo ? <img src={profile.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={64} color="#888" style={{ margin: '18px' }} />}
          </div>
          <div>
            <h2 style={{ color: '#FFF', fontSize: '28px', margin: '0 0 8px 0' }}>{profile.name || "Your Name"}</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={18} /> {profile.phone || "No phone added"}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', color: '#CCC', fontSize: '18px' }}><Calendar size={20} color="var(--accent)" /> {profile.dob || "Add Date of Birth"}</div>
          <div style={{ display: 'flex', gap: '12px', color: '#CCC', fontSize: '18px' }}><MapPin size={20} color="var(--accent)" /> {profile.address || "Add Address"}</div>
          <div style={{ display: 'flex', gap: '12px', color: '#CCC', fontSize: '18px' }}><Mail size={20} color="var(--accent)" /> {profile.email || "Add Email"}</div>
          
          {profile.notes && (
            <div style={{ marginTop: '12px', backgroundColor: '#222', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--error)' }}>
              <div style={{ display: 'flex', gap: '8px', color: 'var(--error)', fontWeight: 'bold', marginBottom: '8px' }}><HeartPulse size={20} /> Medical / Extra Notes</div>
              <p style={{ color: '#FFF', margin: 0, fontSize: '18px', lineHeight: '1.4' }}>{profile.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const addContact = () => {
    saveContacts([...contacts, { id: Date.now(), name: '', phone: '', relation: '' }]);
    setIsEditingContacts(true);
  };

  const updateContact = (id, field, value) => {
    saveContacts(contacts.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const deleteContact = (id) => {
    saveContacts(contacts.filter(c => c.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px', paddingTop: '12px', overflowY: 'auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '14px 20px', borderRadius: '16px', color: '#FFF', fontSize: '22px', fontWeight: 'bold', border: 'none' }}>
          <ArrowLeft size={24} /> Back
        </button>
        <h2 style={{ color: 'var(--accent)', margin: 0, fontSize: '26px' }}>Directory</h2>
      </div>

      {/* 1. App Owner Personal Profile */}
      {renderProfile()}

      {/* 2. Family Call Roster */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '24px', color: '#FFF', margin: 0 }}>Family Contacts</h3>
        <button onClick={() => setIsEditingContacts(!isEditingContacts)} style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '18px' }}>
          {isEditingContacts ? 'Done Editing' : 'Edit List'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {contacts.map((contact) => (
          <div key={contact.id} style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isEditingContacts ? (
              <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '12px' }}>
                <input value={contact.name} onChange={(e) => updateContact(contact.id, 'name', e.target.value)} placeholder="Name" style={{ padding: '12px', fontSize: '18px', borderRadius: '8px', backgroundColor: '#222', color: '#FFF', border: '1px solid #555' }} />
                <input value={contact.relation} onChange={(e) => updateContact(contact.id, 'relation', e.target.value)} placeholder="Relation (e.g. Son)" style={{ padding: '12px', fontSize: '18px', borderRadius: '8px', backgroundColor: '#222', color: '#FFF', border: '1px solid #555' }} />
                <input value={contact.phone} onChange={(e) => updateContact(contact.id, 'phone', e.target.value)} placeholder="Phone Number" style={{ padding: '12px', fontSize: '18px', borderRadius: '8px', backgroundColor: '#222', color: '#FFF', border: '1px solid #555' }} />
                <button onClick={() => deleteContact(contact.id)} style={{ backgroundColor: 'transparent', border: '2px solid var(--error)', color: 'var(--error)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Trash2 size={24} /> Remove Contact
                </button>
              </div>
            ) : (
              <>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFF', marginBottom: '4px' }}>{contact.name || "Unnamed"}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '18px' }}>{contact.relation}</div>
                </div>
                <a href={`tel:${contact.phone}`} style={{ backgroundColor: '#2E7D32', width: '70px', height: '70px', borderRadius: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#FFF', textDecoration: 'none', flexShrink: 0 }}>
                  <Phone size={32} />
                </a>
              </>
            )}
          </div>
        ))}

        {isEditingContacts && (
          <button onClick={addContact} style={{ backgroundColor: '#333', border: '2px dashed #666', color: '#FFF', padding: '20px', borderRadius: '20px', fontSize: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
            <Plus size={28} /> Add New Contact
          </button>
        )}
        
        {!isEditingContacts && contacts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666', fontSize: '20px' }}>Tap 'Edit List' to add family members.</div>
        )}
      </div>

    </div>
  );
}
