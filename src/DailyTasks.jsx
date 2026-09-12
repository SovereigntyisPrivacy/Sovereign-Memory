import { useState, useEffect, useRef } from 'react';
import { Plus, Check, Archive, Trash2, ArrowLeft, ArrowRight, Mic, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

export default function DailyTasks() {
  const [lists, setLists] = useState([]);
  const [view, setView] = useState('dashboard');
  const [activeListId, setActiveListId] = useState(null);
  const [activeTab, setActiveTab] = useState('Active');
  
  const [newListTitle, setNewListTitle] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState(null); // For color/urgent menus
  
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const originalTextRef = useRef('');
  const activeTargetRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('sovereign_memory_tasklists');
    if (saved) setLists(JSON.parse(saved));
  }, []);

  const saveLists = (updatedLists) => {
    localStorage.setItem('sovereign_memory_tasklists', JSON.stringify(updatedLists));
    setLists(updatedLists);
  };

  const createNewList = () => {
    if (!newListTitle.trim()) return;
    const newList = { id: Date.now().toString(), title: newListTitle, status: 'active', createdAt: new Date().toLocaleDateString(), tasks: [] };
    saveLists([newList, ...lists]);
    setNewListTitle('');
    setActiveListId(newList.id);
    setView('insideList');
  };

  const archiveList = (listId) => {
    const updated = lists.map(list => list.id === listId ? { ...list, status: 'archived', archivedAt: new Date().toLocaleDateString() } : list);
    saveLists(updated);
    setView('dashboard');
  };

  const deleteList = (listId) => {
    const updated = lists.filter(list => list.id !== listId);
    saveLists(updated);
  };

  const addTask = (listId) => {
    if (!newTaskText.trim()) return;
    const updated = lists.map(list => {
      if (list.id === listId) {
        return { 
          ...list, 
          tasks: [...list.tasks, { 
            id: Date.now().toString(), text: newTaskText.trim(), completed: false, completedAt: null, isUrgent: false, color: 'var(--surface)' 
          }] 
        };
      }
      return list;
    });
    saveLists(updated);
    setNewTaskText('');
  };

  const updateTask = (listId, taskId, updates) => {
    const updated = lists.map(list => {
      if (list.id === listId) {
        return { ...list, tasks: list.tasks.map(task => task.id === taskId ? { ...task, ...updates } : task) };
      }
      return list;
    });
    saveLists(updated);
  };

  const toggleTask = (listId, taskId) => {
    const updated = lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          tasks: list.tasks.map(task => {
            if (task.id === taskId) {
              const isCompleted = !task.completed;
              return { ...task, completed: isCompleted, completedAt: isCompleted ? new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null };
            }
            return task;
          })
        };
      }
      return list;
    });
    saveLists(updated);
  };

  const deleteTask = (listId, taskId) => {
    const updated = lists.map(list => {
      if (list.id === listId) { return { ...list, tasks: list.tasks.filter(task => task.id !== taskId) }; }
      return list;
    });
    saveLists(updated);
  };

  const toggleDictation = async (target) => {
    try {
      const { speechRecognition } = await SpeechRecognition.requestPermissions();
      if (speechRecognition !== 'granted') return;
      setIsListening(true);
      const result = await SpeechRecognition.start({
        language: "en-US", prompt: "Speak your task...", partialResults: false, popup: true
      });
      if (result && result.matches && result.matches.length > 0) {
        const spoken = result.matches[0];
        if (target === 'title') setNewListTitle(prev => (prev + ' ' + spoken).trim());
        if (target === 'task') setNewTaskText(prev => (prev + ' ' + spoken).trim());
      }
    } catch (e) { console.log("Dictation closed"); } finally { setIsListening(false); }
  };

  const activeLists = lists.filter(l => l.status === 'active');
  const archivedLists = lists.filter(l => l.status === 'archived');
  const activeList = lists.find(l => l.id === activeListId);

  if (view === 'dashboard') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <button onClick={() => setActiveTab('Active')} style={{ backgroundColor: activeTab === 'Active' ? 'var(--accent)' : 'var(--surface)', color: activeTab === 'Active' ? '#000' : '#FFF', fontSize: '20px', padding: '16px', flex: 1, justifyContent: 'center' }}>Active Tasks</button>
          <button onClick={() => setActiveTab('History')} style={{ backgroundColor: activeTab === 'History' ? 'var(--accent)' : 'var(--surface)', color: activeTab === 'History' ? '#000' : '#FFF', fontSize: '20px', padding: '16px', flex: 1, justifyContent: 'center' }}>History</button>
        </div>

        {activeTab === 'Active' && (
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <button className="primary-btn" onClick={() => setView('createList')} style={{ marginBottom: '24px', justifyContent: 'center' }}><Plus size={28} /> Create New Checklist</button>
            {activeLists.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No active checklists.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
                {activeLists.map(list => (
                  <button key={list.id} onClick={() => { setActiveListId(list.id); setView('insideList'); }} style={{ backgroundColor: 'var(--surface)', border: '4px solid #555', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ textAlign: 'left' }}>
                      <h3 style={{ fontSize: '28px', color: 'var(--accent)', margin: '0 0 8px 0' }}>{list.title}</h3>
                      <span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>{list.tasks.filter(t => t.completed).length} / {list.tasks.length} completed</span>
                    </div>
                    <ArrowRight size={32} color="var(--accent)" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'History' && (
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
            {archivedLists.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Historical ledger is empty.</div>
            ) : (
              archivedLists.map(list => (
                <div key={list.id} style={{ backgroundColor: '#111', border: '2px solid #333', borderRadius: '16px', padding: '24px' }}>
                  <h3 style={{ fontSize: '24px', color: '#888', margin: '0 0 8px 0' }}>{list.title}</h3>
                  <div style={{ fontSize: '16px', color: '#555', marginBottom: '16px' }}>Archived: {list.archivedAt}</div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => { const updated = lists.map(l => l.id === list.id ? { ...l, status: 'active', archivedAt: null } : l); saveLists(updated); }} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', border: '2px solid var(--accent)', color: 'var(--accent)' }}>Restore</button>
                    <button onClick={() => deleteList(list.id)} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', border: '2px solid var(--error)', color: 'var(--error)' }}>Purge</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  if (view === 'createList') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px' }}>
        <h2 style={{ marginBottom: '24px' }}>Name Your Checklist</h2>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <textarea value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)} placeholder="e.g., Morning Routine" style={{ flex: 1, padding: '20px', fontSize: '28px', borderRadius: '16px', backgroundColor: '#222', color: '#FFF', border: '2px solid #555', minHeight: '120px', resize: 'none' }} />
          <button onClick={() => toggleDictation('title')} style={{ width: '90px', backgroundColor: isListening ? 'var(--error)' : 'var(--surface)', border: isListening ? 'none' : '2px solid #555', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
            <Mic size={32} color={isListening ? '#000' : 'var(--accent)'} />
            <span style={{ fontSize: '14px', marginTop: '8px', color: isListening ? '#000' : '#FFF' }}>{isListening ? 'Stop' : 'Dictate'}</span>
          </button>
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
          <button onClick={() => setView('dashboard')} style={{ flex: 1, justifyContent: 'center', backgroundColor: '#333' }}>Cancel</button>
          <button className="primary-btn" onClick={createNewList} style={{ flex: 2, justifyContent: 'center' }}>Save & Add Tasks</button>
        </div>
      </div>
    );
  }

  if (view === 'insideList' && activeList) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button onClick={() => setView('dashboard')} style={{ width: 'auto', padding: '12px 24px', backgroundColor: '#333' }}><ArrowLeft size={24} /> Back</button>
          <button onClick={() => archiveList(activeList.id)} style={{ width: 'auto', padding: '12px 24px', backgroundColor: 'transparent', border: '2px solid var(--accent)', color: 'var(--accent)' }}><Archive size={24} /> Archive</button>
        </div>
        
        <h2 style={{ fontSize: '36px', color: 'var(--accent)', marginBottom: '24px' }}>{activeList.title}</h2>
        
        {/* TASK LIST AREA */}
        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {activeList.tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No tasks yet. Add one below.</div>
          ) : (
            activeList.tasks.map(task => {
              const isExpanded = expandedTaskId === task.id;
              return (
                <div key={task.id} style={{ backgroundColor: task.completed ? '#2E7D32' : task.color, border: task.isUrgent ? '4px solid var(--error)' : '4px solid #555', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.2s' }}>
                  
                  {/* Task Main Header */}
                  <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    
                    {/* Big Checkbox */}
                    <button onClick={() => toggleTask(activeList.id, task.id)} style={{ flexShrink: 0, padding: 0, width: '48px', height: '48px', borderRadius: '12px', border: task.completed ? 'none' : '4px solid #FFF', backgroundColor: task.completed ? 'var(--accent)' : 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {task.completed && <Check size={32} color="#000" />}
                    </button>
                    
                    {/* Task Text (Tapping it toggles completion) */}
                    <div style={{ flexGrow: 1, fontSize: '26px', color: '#FFF', textDecoration: task.completed ? 'line-through' : 'none', cursor: 'pointer' }} onClick={() => toggleTask(activeList.id, task.id)}>
                      {task.isUrgent && <AlertTriangle size={24} color={task.completed ? '#FFF' : 'var(--error)'} style={{ display: 'inline', marginRight: '8px' }} />}
                      {task.text}
                      {task.completedAt && <div style={{ fontSize: '16px', color: '#E8F5E9', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> Completed at {task.completedAt}</div>}
                    </div>
                    
                    {/* Open Tools Drawer */}
                    <button onClick={() => setExpandedTaskId(isExpanded ? null : task.id)} style={{ padding: '12px', backgroundColor: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '12px' }}>
                      {isExpanded ? <ChevronUp size={32} color="#FFF"/> : <ChevronDown size={32} color="#FFF"/>}
                    </button>
                  </div>

                  {/* Task Tools Drawer (Colors, Urgent, Delete) */}
                  {isExpanded && (
                    <div style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <label style={{ color: '#DDD', fontSize: '16px', marginBottom: '-8px' }}>Color Code:</label>
                      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                        {['var(--surface)', '#7F1D1D', '#1E3A8A', '#14532D', '#713F12'].map(c => (
                          <button key={c} onClick={() => updateTask(activeList.id, task.id, { color: c })} style={{ minWidth: '60px', height: '60px', borderRadius: '12px', backgroundColor: c, border: task.color === c ? '4px solid #FFF' : '2px solid #555' }} />
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                        <button onClick={() => updateTask(activeList.id, task.id, { isUrgent: !task.isUrgent })} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: task.isUrgent ? 'var(--error)' : '#333', color: task.isUrgent ? '#000' : '#FFF', padding: '16px', borderRadius: '16px', fontSize: '20px', fontWeight: 'bold' }}>
                          <AlertTriangle size={24} /> {task.isUrgent ? 'Unmark Urgent' : 'Mark Urgent'}
                        </button>
                        <button onClick={() => deleteTask(activeList.id, task.id)} style={{ flex: 1, backgroundColor: 'transparent', border: '2px solid var(--error)', color: 'var(--error)', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'center' }}>
                          <Trash2 size={28} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* FIXED ADD TASK INPUT (Stacked Layout) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#111', padding: '20px', borderRadius: '24px', border: '2px solid #333' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Type new task here..."
              style={{ flex: 1, padding: '20px', fontSize: '24px', borderRadius: '16px', backgroundColor: '#222', color: '#FFF', border: 'none' }}
            />
            <button onClick={() => toggleDictation('task')} style={{ width: '80px', backgroundColor: isListening ? 'var(--error)' : '#333', border: 'none', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Mic size={32} color={isListening ? '#000' : 'var(--accent)'} />
            </button>
          </div>
          <button className="primary-btn" onClick={() => addTask(activeList.id)} disabled={!newTaskText.trim()} style={{ width: '100%', justifyContent: 'center', padding: '20px', fontSize: '24px' }}>
            <Plus size={32} /> Add Task to List
          </button>
        </div>

      </div>
    );
  }

  return null;
}
