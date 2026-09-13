import { useState, useEffect } from 'react';
import { ArrowLeft, Home, Plus, Mic, Trash2, Archive, RotateCcw, AlertTriangle, Share2, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { App as CapApp } from '@capacitor/app';

export default function DailyTasks({ goHome }) {
  const [lists, setLists] = useState([]);
  const [view, setView] = useState('active'); // 'active' or 'history'
  const [activeListId, setActiveListId] = useState(null);
  
  const [newListTitle, setNewListTitle] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('sovereign_tasks');
    if (saved) setLists(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const listener = CapApp.addListener('backButton', () => {
      if (activeListId) setActiveListId(null);
      else if (goHome) goHome();
    });
    return () => { listener.remove(); };
  }, [activeListId, goHome]);

  const saveLists = (updated) => {
    localStorage.setItem('sovereign_tasks', JSON.stringify(updated));
    setLists(updated);
  };

  const toggleDictation = async (setter) => {
    try {
      const { speechRecognition } = await SpeechRecognition.requestPermissions();
      if (speechRecognition !== 'granted') return alert("Microphone permission needed.");
      setIsListening(true);
      const result = await SpeechRecognition.start({ language: "en-US", prompt: "Speak now...", partialResults: false, popup: true });
      if (result && result.matches && result.matches.length > 0) setter(prev => (prev + ' ' + result.matches[0]).trim());
    } catch (e) { console.log("Dictation closed"); } finally { setIsListening(false); }
  };

  const createList = () => {
    if (!newListTitle.trim()) return;
    const newList = { id: Date.now(), title: newListTitle, tasks: [], archivedAt: null };
    saveLists([newList, ...lists]);
    setNewListTitle('');
  };

  const archiveList = (id) => {
    const updated = lists.map(l => l.id === id ? { ...l, archivedAt: new Date().toLocaleDateString() } : l);
    saveLists(updated);
    setActiveListId(null);
  };

  const restoreList = (id) => {
    const updated = lists.map(l => l.id === id ? { ...l, archivedAt: null } : l);
    saveLists(updated);
  };

  const purgeList = (id) => {
    if (window.confirm("Permanently delete this list?")) saveLists(lists.filter(l => l.id !== id));
  };

  const addTask = (listId) => {
    if (!newTaskText.trim()) return;
    const task = { id: Date.now(), text: newTaskText, completed: false, completedAt: null, urgent: false, color: '#222' };
    const updated = lists.map(l => l.id === listId ? { ...l, tasks: [...l.tasks, task] } : l);
    saveLists(updated);
    setNewTaskText('');
  };

  const toggleTaskCompletion = (listId, taskId) => {
    const updated = lists.map(l => {
      if (l.id === listId) {
        const newTasks = l.tasks.map(t => {
          if (t.id === taskId) {
            const isDone = !t.completed;
            return { ...t, completed: isDone, completedAt: isDone ? new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ' on ' + new Date().toLocaleDateString() : null };
          }
          return t;
        });
        return { ...l, tasks: newTasks };
      }
      return l;
    });
    saveLists(updated);
  };

  const toggleUrgent = (listId, taskId) => {
    const updated = lists.map(l => l.id === listId ? { ...l, tasks: l.tasks.map(t => t.id === taskId ? { ...t, urgent: !t.urgent } : t) } : l);
    saveLists(updated);
  };

  const updateTaskColor = (listId, taskId, color) => {
    const updated = lists.map(l => l.id === listId ? { ...l, tasks: l.tasks.map(t => t.id === taskId ? { ...t, color } : t) } : l);
    saveLists(updated);
  };

  const deleteTask = (listId, taskId) => {
    const updated = lists.map(l => l.id === listId ? { ...l, tasks: l.tasks.filter(t => t.id !== taskId) } : l);
    saveLists(updated);
  };

  const exportHistoryList = (list) => {
    let body = `Checklist: ${list.title}\nArchived: ${list.archivedAt}\n\n`;
    list.tasks.forEach(t => {
      body += `[${t.completed ? 'X' : ' '}] ${t.text}\n`;
      if (t.completed) body += `    Completed: ${t.completedAt}\n`;
      if (t.urgent) body += `    *Marked Urgent*\n`;
    });
    window.location.href = `mailto:?subject=Task History: ${encodeURIComponent(list.title)}&body=${encodeURIComponent(body)}`;
  };

  const COLORS = ['#222', '#7A2828', '#1C3B5E', '#2E5A2C', '#8B4513'];

  if (activeListId) {
    const list = lists.find(l => l.id === activeListId);
    if (!list) { setActiveListId(null); return null; }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => setActiveListId(null)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#333', padding: '16px', borderRadius: '16px', color: '#FFF', fontSize: '20px', fontWeight: 'bold', border: 'none' }}>
            <ArrowLeft size={24} /> Back
          </button>
          <button onClick={() => archiveList(list.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: 'transparent', border: '2px solid #FF9500', padding: '16px', borderRadius: '16px', color: '#FF9500', fontSize: '20px', fontWeight: 'bold' }}>
            <Archive size={24} /> Archive
          </button>
        </div>

        <h2 style={{ color: '#FF9500', fontSize: '32px', margin: '0 0 24px 0' }}>{list.title}</h2>

        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {list.tasks.length === 0 ? <p style={{ color: '#AAA', fontSize: '20px', textAlign: 'center' }}>No tasks yet. Add one below.</p> : 
            list.tasks.map(t => (
              <div key={t.id} style={{ backgroundColor: t.completed ? '#2E7D32' : (t.urgent ? '#8B0000' : t.color), borderRadius: '16px', padding: '20px', border: t.urgent ? '2px solid #FF3B30' : '2px solid transparent' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <button onClick={() => toggleTaskCompletion(list.id, t.id)} style={{ width: '40px', height: '40px', borderRadius: '8px', border: '2px solid #FFF', backgroundColor: t.completed ? '#FF9500' : 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                    {t.completed && <Check size={28} color="#000" />}
                  </button>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      {t.urgent && !t.completed && <AlertTriangle size={20} color="#FF3B30" />}
                      <span style={{ fontSize: '24px', color: '#FFF', textDecoration: t.completed ? 'line-through' : 'none' }}>{t.text}</span>
                    </div>
                    {t.completed && <div style={{ fontSize: '16px', color: '#E0E0E0' }}>Completed {t.completedAt}</div>}
                  </div>
                </div>
                
                {!t.completed && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                    <div style={{ fontSize: '16px', color: '#CCC', marginBottom: '8px' }}>Color Code:</div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                      {COLORS.map(c => (
                        <button key={c} onClick={() => updateTaskColor(list.id, t.id, c)} style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: c, border: t.color === c ? '2px solid #FFF' : '2px solid transparent' }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => toggleUrgent(list.id, t.id)} style={{ flex: 1, backgroundColor: t.urgent ? '#FF6B6B' : 'rgba(255,59,48,0.2)', color: t.urgent ? '#000' : '#FF3B30', padding: '12px', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={20} /> {t.urgent ? 'Unmark Urgent' : 'Mark Urgent'}
                      </button>
                      <button onClick={() => deleteTask(list.id, t.id)} style={{ backgroundColor: 'transparent', border: '2px solid #FF3B30', color: '#FF3B30', padding: '12px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Trash2 size={24} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          }
        </div>

        <div style={{ backgroundColor: '#222', padding: '16px', borderRadius: '20px', border: '2px solid #444' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', width: '100%', boxSizing: 'border-box' }}>
            <input value={newTaskText} onChange={e => setNewTaskText(e.target.value)} placeholder="Type new task here..." style={{ flex: 1, minWidth: 0, backgroundColor: '#111', color: '#FFF', fontSize: '20px', padding: '16px', borderRadius: '12px', border: 'none', outline: 'none' }} />
            <button onClick={() => toggleDictation(setNewTaskText)} style={{ width: '64px', height: '64px', padding: '0', backgroundColor: '#333', borderRadius: '12px', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
              <Mic size={28} color={isListening ? '#00FF00' : '#FF9500'} />
            </button>
          </div>
          <button onClick={() => addTask(list.id)} style={{ width: '100%', backgroundColor: '#FF9500', color: '#000', padding: '16px', borderRadius: '12px', fontSize: '22px', fontWeight: 'bold', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <Plus size={24} /> Add Task to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '12px', paddingBottom: '24px' }}>
      
      <button onClick={goHome} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#333', padding: '12px 20px', borderRadius: '16px', color: '#FFF', fontSize: '20px', fontWeight: 'bold', border: 'none', marginBottom: '16px' }}>
        <Home size={24} /> Dashboard
      </button>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => setView('active')} style={{ flex: 1, backgroundColor: view === 'active' ? '#FF9500' : '#222', color: view === 'active' ? '#000' : '#FFF', padding: '16px', borderRadius: '16px', fontSize: '22px', fontWeight: 'bold', border: 'none' }}>Active Tasks</button>
        <button onClick={() => setView('history')} style={{ flex: 1, backgroundColor: view === 'history' ? '#FF9500' : '#222', color: view === 'history' ? '#000' : '#FFF', padding: '16px', borderRadius: '16px', fontSize: '22px', fontWeight: 'bold', border: 'none' }}>History</button>
      </div>

      {view === 'active' && (
        <>
          <div style={{ backgroundColor: '#FF9500', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', width: '100%', boxSizing: 'border-box' }}>
              <input value={newListTitle} onChange={e => setNewListTitle(e.target.value)} placeholder="List Title..." style={{ flex: 1, minWidth: 0, backgroundColor: 'rgba(0,0,0,0.2)', color: '#000', fontSize: '22px', padding: '16px', borderRadius: '12px', border: 'none', outline: 'none', fontWeight: 'bold' }} />
              <button onClick={() => toggleDictation(setNewListTitle)} style={{ width: '64px', height: '64px', padding: '0', backgroundColor: '#000', borderRadius: '12px', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                <Mic size={24} color="#FF9500" />
              </button>
            </div>
            <button onClick={createList} style={{ width: '100%', backgroundColor: '#000', color: '#FF9500', padding: '16px', borderRadius: '12px', fontSize: '24px', fontWeight: 'bold', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <Plus size={28} /> Create New Checklist
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
            {lists.filter(l => !l.archivedAt).length === 0 ? <p style={{ color: '#888', textAlign: 'center', fontSize: '20px' }}>No active lists.</p> : 
              lists.filter(l => !l.archivedAt).map(list => {
                const completed = list.tasks.filter(t => t.completed).length;
                return (
                  <button key={list.id} onClick={() => setActiveListId(list.id)} style={{ backgroundColor: '#222', border: '2px solid #444', borderRadius: '16px', padding: '24px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: '#FF9500', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{list.title}</div>
                      <div style={{ color: '#CCC', fontSize: '18px' }}>{completed} / {list.tasks.length} completed</div>
                    </div>
                    <ArrowLeft size={32} color="#FF9500" style={{ transform: 'rotate(180deg)' }} />
                  </button>
                );
              })
            }
          </div>
        </>
      )}

      {view === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          {lists.filter(l => l.archivedAt).length === 0 ? <p style={{ color: '#888', textAlign: 'center', fontSize: '20px' }}>No archived lists.</p> : 
            lists.filter(l => l.archivedAt).map(list => {
              const isExpanded = expandedHistory[list.id];
              return (
                <div key={list.id} style={{ backgroundColor: '#222', border: '2px solid #555', borderRadius: '16px', overflow: 'hidden' }}>
                  <div onClick={() => setExpandedHistory(prev => ({...prev, [list.id]: !prev[list.id]}))} style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: '#FFF', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{list.title}</div>
                      <div style={{ color: '#888', fontSize: '18px' }}>Archived: {list.archivedAt}</div>
                    </div>
                    {isExpanded ? <ChevronUp size={32} color="#FFF"/> : <ChevronDown size={32} color="#FFF"/>}
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '20px', borderTop: '2px solid #444', backgroundColor: '#1a1a1a' }}>
                      <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {list.tasks.map(t => (
                          <div key={t.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', color: '#FFF', fontSize: '20px' }}>
                            <div style={{ marginTop: '4px' }}>{t.completed ? <Check size={20} color="#00FF00" /> : <AlertTriangle size={20} color="#FF3B30" />}</div>
                            <div>
                              <div style={{ textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? '#AAA' : '#FFF' }}>{t.text}</div>
                              {t.completed && t.completedAt && <div style={{ fontSize: '16px', color: '#888', marginTop: '4px' }}>Done: {t.completedAt}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => restoreList(list.id)} style={{ flex: 1, backgroundColor: 'transparent', border: '2px solid #FF9500', color: '#FF9500', padding: '16px', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                          <RotateCcw size={24} /> Restore
                        </button>
                        <button onClick={() => purgeList(list.id)} style={{ flex: 1, backgroundColor: 'rgba(255,59,48,0.2)', border: '2px solid #FF3B30', color: '#FF3B30', padding: '16px', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                          <Trash2 size={24} /> Purge
                        </button>
                      </div>
                      <button onClick={() => exportHistoryList(list)} style={{ width: '100%', marginTop: '12px', backgroundColor: '#1E3A8A', color: '#FFF', padding: '16px', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <Share2 size={24} /> Export List
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          }
        </div>
      )}
    </div>
  );
}
