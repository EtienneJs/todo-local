// ============================================
// CONSTANTS
// ============================================
const SECTIONS = ['bank', 'product', 'buy-history', 'contador', 'tropy', 'daily-tasks'];
const SECTION_TOTALS = {
  'bank': 9,
  'product': 6,
  'buy-history': 5,
  'contador': 5,
  'tropy': 5,
  'daily-tasks': 0
};

const STORAGE_KEYS = {
  CUSTOM_TASKS: 'customTasks',
  CONFETI_SHOWN: 'confetiShown',
  CONFETI_SECTION: 'confetiSection-'
};

const METHOD_COLORS = {
  'get': 'get',
  'post': 'post',
  'patch': 'patch',
  'put': 'patch',
  'delete': 'delete'
};

const CONFETTI_CONFIG = {
  SIMPLE: {
    emojis: ['✅', '🎉'],
    emojiSize: 80,
    confettiNumber: 30
  },
  FULL: {
    emojis: ['🎉', '✅', '🚀', '⭐', '🎊', '💯'],
    emojiSize: 100,
    confettiNumber: 50
  }
};

const DELAYS = {
  STATS_UPDATE: 100,
  CONFETTI_SECOND: 500,
  CONFETTI_THIRD: 1000
};

// ============================================
// STATE MANAGEMENT
// ============================================
let currentSection = 'bank';
let sectionTotals = { ...SECTION_TOTALS };
let confetti = null;

// ============================================
// DOM UTILITIES
// ============================================
const DOMUtils = {
  getElement: (id) => document.getElementById(id),
  
  getElements: (selector) => document.querySelectorAll(selector),
  
  createElement: (tag, className = '', attributes = {}) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  }
};

// ============================================
// LOCAL STORAGE UTILITIES
// ============================================
const StorageUtils = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage for key "${key}":`, error);
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage for key "${key}":`, error);
    }
  },
  
  getCustomTasks: () => StorageUtils.get(STORAGE_KEYS.CUSTOM_TASKS, []),
  
  saveCustomTasks: (tasks) => StorageUtils.set(STORAGE_KEYS.CUSTOM_TASKS, tasks),
  
  getTaskState: (taskId) => localStorage.getItem(taskId) === 'true',
  
  setTaskState: (taskId, isCompleted) => {
    localStorage.setItem(taskId, isCompleted);
  },
  
  removeTaskState: (taskId) => StorageUtils.remove(taskId)
};

// ============================================
// TASK MANAGEMENT
// ============================================
const TaskManager = {
  createTaskId: (section) => `custom-${section}-${Date.now()}`,
  
  validateTask: (title, path) => {
    if (!title || !path) {
      alert('Por favor completa los campos requeridos');
      return false;
    }
    return true;
  },
  
  parseJson: (jsonString) => {
    if (!jsonString.trim()) return null;
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      alert('El JSON proporcionado no es válido');
      return null;
    }
  },
  
  createTask: (formData) => {
    const { title, method, path, json, notes, section } = formData;
    
    if (!TaskManager.validateTask(title, path)) return null;
    
    const parsedJson = TaskManager.parseJson(json);
    if (parsedJson === null && json.trim()) return null;
    
    return {
      id: TaskManager.createTaskId(section),
      section,
      title,
      method,
      path,
      json: parsedJson,
      notes
    };
  },
  
  saveTask: (task) => {
    const customTasks = StorageUtils.getCustomTasks();
    customTasks.push(task);
    StorageUtils.saveCustomTasks(customTasks);
  },
  
  deleteTask: (taskId) => {
    const customTasks = StorageUtils.getCustomTasks();
    const filtered = customTasks.filter(t => t.id !== taskId);
    StorageUtils.saveCustomTasks(filtered);
    StorageUtils.removeTaskState(taskId);
  }
};

// ============================================
// DOM RENDERING
// ============================================
const TaskRenderer = {
  getMethodClass: (method) => {
    const methodLower = method.toLowerCase();
    return METHOD_COLORS[methodLower] || 'get';
  },
  
  buildTaskHTML: (task) => {
    const methodClass = TaskRenderer.getMethodClass(task.method);
    let html = `
      <label>
        <input type="checkbox" data-endpoint="${task.id}" data-section="${task.section}">
        <span class="method ${methodClass}">${task.method}</span>
        <span class="endpoint-path">${task.path}</span>
      </label>
      <button class="delete-endpoint" onclick="deleteCustomTask('${task.id}', '${task.section}')" title="Eliminar tarea">🗑️</button>
    `;
    
    if (task.json) {
      html += `<div class="code-block">${JSON.stringify(task.json, null, 2)}</div>`;
    }
    
    if (task.notes) {
      html += `
        <div class="notes">
          <strong>Notas:</strong>
          <div>${task.notes.replace(/\n/g, '<br>')}</div>
        </div>
      `;
    }
    
    return html;
  },
  
  insertTaskIntoDOM: (task, sectionElement) => {
    const endpointItem = DOMUtils.createElement('div', 'endpoint-item custom-endpoint-item', {
      'data-task-id': task.id
    });
    
    endpointItem.innerHTML = TaskRenderer.buildTaskHTML(task);
    
    const addButton = sectionElement.querySelector('.add-task-button');
    const navigation = sectionElement.querySelector('.navigation');
    
    if (addButton) {
      addButton.parentNode.insertBefore(endpointItem, addButton);
    } else if (navigation) {
      navigation.parentNode.insertBefore(endpointItem, navigation);
    } else {
      sectionElement.appendChild(endpointItem);
    }
    
    return endpointItem;
  },
  
  attachCheckboxListener: (checkbox) => {
    if (checkbox.hasAttribute('data-listener-attached')) return;
    
    checkbox.setAttribute('data-listener-attached', 'true');
    checkbox.addEventListener('change', () => {
      StateManager.saveTaskState(checkbox);
    });
  }
};

// ============================================
// STATISTICS MANAGEMENT
// ============================================
const StatisticsManager = {
  calculateSectionStats: (sectionName) => {
    const checkboxes = DOMUtils.getElements(`input[data-section="${sectionName}"]`);
    const total = checkboxes.length;
    const completed = Array.from(checkboxes).filter(cb => cb.checked).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    sectionTotals[sectionName] = total;
    
    return { total, completed, percentage };
  },
  
  updateSectionStats: (sectionName) => {
    const { total, completed, percentage } = StatisticsManager.calculateSectionStats(sectionName);
    
    const elements = {
      completed: DOMUtils.getElement(`${sectionName}-completed`),
      total: DOMUtils.getElement(`${sectionName}-total`),
      percentage: DOMUtils.getElement(`${sectionName}-percentage`),
      progress: DOMUtils.getElement(`${sectionName}-progress`)
    };
    
    if (elements.completed) elements.completed.textContent = completed;
    if (elements.total) elements.total.textContent = total;
    if (elements.percentage) elements.percentage.textContent = `${percentage}%`;
    if (elements.progress) elements.progress.textContent = `${completed}/${total}`;
    
    StatisticsManager.updateSidebarButton(sectionName, completed, total);
    ConfettiManager.checkSectionCompleted(sectionName, completed, total);
  },
  
  updateSidebarButton: (sectionName, completed, total) => {
    const sidebarButton = DOMUtils.getElements(`[data-section="${sectionName}"]`)[0];
    if (!sidebarButton) return;
    
    if (completed === total && total > 0) {
      sidebarButton.classList.add('completed');
    } else {
      sidebarButton.classList.remove('completed');
    }
  },
  
  updateGlobalStats: () => {
    const allCheckboxes = DOMUtils.getElements('input[type="checkbox"]');
    const globalTotal = allCheckboxes.length;
    const globalCompleted = Array.from(allCheckboxes).filter(cb => cb.checked).length;
    const globalPercentage = globalTotal > 0 ? Math.round((globalCompleted / globalTotal) * 100) : 0;
    
    const globalCompletedEl = DOMUtils.getElement('global-completed');
    const globalTotalEl = DOMUtils.getElement('global-total');
    const globalPercentageEl = DOMUtils.getElement('global-percentage');
    
    if (globalCompletedEl) globalCompletedEl.textContent = globalCompleted;
    if (globalTotalEl) globalTotalEl.textContent = globalTotal;
    if (globalPercentageEl) globalPercentageEl.textContent = `${globalPercentage}%`;
    
    ConfettiManager.checkAllTasksCompleted(globalTotal, globalCompleted);
  },
  
  updateAllStats: () => {
    SECTIONS.forEach(section => {
      StatisticsManager.updateSectionStats(section);
    });
    StatisticsManager.updateGlobalStats();
  }
};

// ============================================
// CONFETTI MANAGEMENT
// ============================================
const ConfettiManager = {
  initialize: () => {
    if (typeof JSConfetti !== 'undefined' && !confetti) {
      confetti = new JSConfetti();
    }
  },
  
  showSimple: () => {
    ConfettiManager.initialize();
    if (!confetti) {
      console.log('JSConfetti no está cargado aún');
      return;
    }
    confetti.addConfetti(CONFETTI_CONFIG.SIMPLE);
  },
  
  showFull: () => {
    ConfettiManager.initialize();
    if (!confetti) {
      console.log('JSConfetti no está cargado aún');
      return;
    }
    
    confetti.addConfetti(CONFETTI_CONFIG.FULL);
    setTimeout(() => confetti.addConfetti(CONFETTI_CONFIG.FULL), DELAYS.CONFETTI_SECOND);
    setTimeout(() => confetti.addConfetti(CONFETTI_CONFIG.FULL), DELAYS.CONFETTI_THIRD);
  },
  
  checkSectionCompleted: (sectionName, completed, total) => {
    if (total > 0 && completed === total) {
      const sectionKey = `${STORAGE_KEYS.CONFETI_SECTION}${sectionName}`;
      const alreadyShown = localStorage.getItem(sectionKey) === 'true';
      
      if (!alreadyShown) {
        ConfettiManager.showSimple();
        localStorage.setItem(sectionKey, 'true');
      }
    } else if (completed < total) {
      StorageUtils.remove(`${STORAGE_KEYS.CONFETI_SECTION}${sectionName}`);
    }
  },
  
  checkAllTasksCompleted: (globalTotal, globalCompleted) => {
    if (globalTotal > 0 && globalCompleted === globalTotal) {
      const alreadyShown = localStorage.getItem(STORAGE_KEYS.CONFETI_SHOWN) === 'true';
      if (!alreadyShown) {
        ConfettiManager.showFull();
        localStorage.setItem(STORAGE_KEYS.CONFETI_SHOWN, 'true');
      }
    } else if (globalCompleted < globalTotal) {
      StorageUtils.remove(STORAGE_KEYS.CONFETI_SHOWN);
    }
  }
};

// ============================================
// STATE MANAGEMENT
// ============================================
const StateManager = {
  saveTaskState: (checkbox, skipUpdate = false) => {
    StorageUtils.setTaskState(checkbox.dataset.endpoint, checkbox.checked);
    UIUtils.updateItemStyle(checkbox);
    if (!skipUpdate) {
      StatisticsManager.updateAllStats();
    }
  },
  
  loadTaskState: (checkbox) => {
    const isCompleted = StorageUtils.getTaskState(checkbox.dataset.endpoint);
    if (isCompleted) {
      checkbox.checked = true;
      UIUtils.updateItemStyle(checkbox);
    }
  },
  
  loadAllStates: () => {
    const checkboxes = DOMUtils.getElements('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      StateManager.loadTaskState(checkbox);
    });
    StatisticsManager.updateAllStats();
  }
};

// ============================================
// UI UTILITIES
// ============================================
const UIUtils = {
  updateItemStyle: (checkbox) => {
    const item = checkbox.closest('.endpoint-item');
    if (!item) return;
    
    if (checkbox.checked) {
      item.classList.add('completed');
    } else {
      item.classList.remove('completed');
    }
  },
  
  showModal: (modalId) => {
    const modal = DOMUtils.getElement(modalId);
    if (modal) modal.classList.add('active');
  },
  
  hideModal: (modalId) => {
    const modal = DOMUtils.getElement(modalId);
    if (modal) modal.classList.remove('active');
  },
  
  resetForm: (formId) => {
    const form = DOMUtils.getElement(formId);
    if (form) form.reset();
  }
};

// ============================================
// NAVIGATION
// ============================================
const NavigationManager = {
  navigateToSection: (sectionName) => {
    DOMUtils.getElements('.section').forEach(section => {
      section.classList.remove('active');
    });
    
    const targetSection = DOMUtils.getElement(`section-${sectionName}`);
    if (targetSection) {
      targetSection.classList.add('active');
    }
    
    currentSection = sectionName;
    NavigationManager.updateNavButtons(sectionName);
    NavigationManager.updateSidebar(sectionName);
  },
  
  updateNavButtons: (sectionName) => {
    const currentIndex = SECTIONS.indexOf(sectionName);
    const prevButton = DOMUtils.getElements(`#section-${sectionName} .nav-button.prev`)[0];
    const nextButton = DOMUtils.getElements(`#section-${sectionName} .nav-button.next`)[0];
    
    if (prevButton) {
      prevButton.disabled = currentIndex === 0;
      if (currentIndex > 0) {
        prevButton.onclick = () => NavigationManager.navigateToSection(SECTIONS[currentIndex - 1]);
      }
    }
    
    if (nextButton) {
      nextButton.disabled = currentIndex === SECTIONS.length - 1;
      if (currentIndex < SECTIONS.length - 1) {
        nextButton.onclick = () => NavigationManager.navigateToSection(SECTIONS[currentIndex + 1]);
      }
    }
  },
  
  updateSidebar: (activeSection) => {
    DOMUtils.getElements('.section-nav-button').forEach(button => {
      button.classList.remove('active');
      if (button.dataset.section === activeSection) {
        button.classList.add('active');
      }
    });
  }
};

// ============================================
// MODAL MANAGEMENT
// ============================================
const ModalManager = {
  open: (section) => {
    const taskSectionInput = DOMUtils.getElement('taskSection');
    if (taskSectionInput) taskSectionInput.value = section;
    
    UIUtils.showModal('addTaskModal');
    
    const taskTitle = DOMUtils.getElement('taskTitle');
    if (taskTitle) taskTitle.focus();
  },
  
  close: () => {
    UIUtils.hideModal('addTaskModal');
    UIUtils.resetForm('addTaskForm');
  },
  
  handleSubmit: (event) => {
    event.preventDefault();
    
    const formData = {
      title: DOMUtils.getElement('taskTitle')?.value.trim() || '',
      method: DOMUtils.getElement('taskMethod')?.value || '',
      path: DOMUtils.getElement('taskPath')?.value.trim() || '',
      json: DOMUtils.getElement('taskJson')?.value.trim() || '',
      notes: DOMUtils.getElement('taskNotes')?.value.trim() || '',
      section: DOMUtils.getElement('taskSection')?.value || ''
    };
    
    const task = TaskManager.createTask(formData);
    if (!task) return;
    
    TaskManager.saveTask(task);
    TaskManager.addTaskToDOM(task);
    StatisticsManager.updateAllStats();
    ModalManager.close();
  }
};

// ============================================
// TASK OPERATIONS
// ============================================
const addTaskToDOM = (task) => {
  const sectionElement = DOMUtils.getElement(`section-${task.section}`);
  if (!sectionElement) return;
  
  const endpointItem = TaskRenderer.insertTaskIntoDOM(task, sectionElement);
  const checkbox = endpointItem.querySelector('input[type="checkbox"]');
  
  if (checkbox) {
    TaskRenderer.attachCheckboxListener(checkbox);
    StateManager.loadTaskState(checkbox);
  }
  
  setTimeout(() => {
    StatisticsManager.updateAllStats();
  }, DELAYS.STATS_UPDATE);
};

// Extend TaskManager with DOM operation
TaskManager.addTaskToDOM = addTaskToDOM;

// ============================================
// PUBLIC API (Functions exposed globally)
// ============================================
function openAddTaskModal(section) {
  ModalManager.open(section);
}

function closeAddTaskModal() {
  ModalManager.close();
}

function addNewTask(event) {
  ModalManager.handleSubmit(event);
}

function deleteCustomTask(taskId, section) {
  if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
    return;
  }
  
  const taskElement = DOMUtils.getElements(`[data-task-id="${taskId}"]`)[0];
  if (taskElement) taskElement.remove();
  
  TaskManager.deleteTask(taskId);
  StatisticsManager.updateAllStats();
}

function navigateSection(sectionName) {
  NavigationManager.navigateToSection(sectionName);
}

function selectSectionTasks(sectionName, select) {
  const checkboxes = DOMUtils.getElements(`input[data-section="${sectionName}"]`);
  checkboxes.forEach(checkbox => {
    checkbox.checked = select;
    UIUtils.updateItemStyle(checkbox);
    StateManager.saveTaskState(checkbox, true);
  });
  StatisticsManager.updateAllStats();
}

// ============================================
// INITIALIZATION
// ============================================
function loadCustomTasks() {
  const customTasks = StorageUtils.getCustomTasks();
  customTasks.forEach(task => {
    addTaskToDOM(task);
  });
  StatisticsManager.updateAllStats();
}

function attachCheckboxListeners() {
  const checkboxes = DOMUtils.getElements('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    TaskRenderer.attachCheckboxListener(checkbox);
  });
}

function initializeNavigation() {
  DOMUtils.getElements('.section-nav-button').forEach(button => {
    button.addEventListener('click', () => {
      NavigationManager.navigateToSection(button.dataset.section);
    });
  });
  NavigationManager.updateNavButtons('bank');
}

function initializeModalClose() {
  window.onclick = (event) => {
    const modal = DOMUtils.getElement('addTaskModal');
    if (event.target === modal) {
      ModalManager.close();
    }
  };
}

// ============================================
// DOM CONTENT LOADED
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  loadCustomTasks();
  StateManager.loadAllStates();
  attachCheckboxListeners();
  initializeNavigation();
  initializeModalClose();
});
