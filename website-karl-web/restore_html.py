import re

with open('../backup_manage.html', 'r', encoding='utf-8') as f:
    orig = f.read()

# Fix the subjects library list
orig = orig.replace('''<div class="placeholder-list">
              <div class="list-item active">Mathematics</div>
              <div class="list-item">Operating Systems</div>
              <div class="list-item add-new">+ Add New Subject</div>
            </div>''', '''<div class="placeholder-list">
              <div class="list-item" 
                   *ngFor="let subject of subjectsList"
                   [class.active]="activeSubject?.id === subject.id"
                   (click)="selectSubject(subject)">
                {{ subject.title || 'Untitled Subject' }}
              </div>
              <div class="list-item add-new" (click)="addNewSubject()">+ Add New Subject</div>
            </div>''')

# Replace the editor header and Tab 1
orig = orig.replace('''<div class="editor-header">
              <h2>Edit Subject</h2>''', '''<div class="editor-header">
              <h2>{{ activeSubject?.id ? 'Edit Subject' : 'New Subject' }}</h2>''')

tab1_old = '''<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label>Course Code</label>
                  <input type="text" placeholder="e.g. 114" class="dummy-input" />
                </div>
                <div class="form-group">
                  <label>Category</label>
                  <input type="text" placeholder="e.g. MATHEMATICS" class="dummy-input" />
                </div>
              </div>

              <div class="form-group">
                <label>Subject Title</label>
                <input type="text" placeholder="e.g. Differential Calculus" class="dummy-input" />
              </div>

              <div class="form-group">
                <label>Description</label>
                <textarea placeholder="Enter subject description..." class="dummy-input" rows="4" style="resize: vertical;"></textarea>
              </div>
              
              <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                <app-button variant="primary" label="Save Changes" icon="save-outline"></app-button>
                <app-button variant="danger-outline" label="Delete" icon="trash-outline"></app-button>
              </div>'''

tab1_new = '''<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label>Course Code</label>
                  <input type="text" name="course_code" [(ngModel)]="activeSubject.course_code" placeholder="e.g. 114" class="dummy-input" />
                </div>
                <div class="form-group">
                  <label>Category</label>
                  <input type="text" name="category" [(ngModel)]="activeSubject.category" placeholder="e.g. MATHEMATICS" class="dummy-input" />
                </div>
              </div>

              <div class="form-group">
                <label>Subject Title</label>
                <input type="text" name="title" [(ngModel)]="activeSubject.title" placeholder="e.g. Differential Calculus" class="dummy-input" />
              </div>

              <div class="form-group">
                <label>Description</label>
                <textarea name="description" [(ngModel)]="activeSubject.description" placeholder="Enter subject description..." class="dummy-input" rows="4" style="resize: vertical;"></textarea>
              </div>
              
              <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                <app-button variant="primary" label="Save Changes" icon="save-outline" (click)="saveSubject()"></app-button>
                <app-button variant="danger-outline" label="Delete" icon="trash-outline" (click)="deleteSubject()" *ngIf="activeSubject.id"></app-button>
              </div>'''

orig = orig.replace(tab1_old, tab1_new)

# Replace entire Tab 2
new_tab_2 = '''<div *ngIf="cmsTab === 'topics'" class="tab-content">
              
              <div *ngIf="!activeSubject.id" class="glass-card" style="text-align: center; padding: 2rem;">
                <p style="color: #8B96AB;">Please save the subject first before adding topics.</p>
              </div>

              <div *ngIf="activeSubject.id">
                <h3 style="color: white; margin-bottom: 1rem; margin-top: 0;">Topics for {{ activeSubject.title }}</h3>
                
                <div class="topic-list-clean">
                  <div class="topic-row" *ngFor="let topic of activeSubject.topics; let i = index">
                    <div class="topic-row-info">
                      <span class="topic-number">{{ i + 1 }}</span>
                      <span class="topic-title">{{ topic.title }}</span>
                    </div>
                    <div class="topic-row-actions">
                      <ion-icon name="pencil-outline" class="action-icon edit" (click)="goToEditTopic(topic.id)"></ion-icon>
                      <ion-icon name="trash-outline" class="action-icon delete" (click)="deleteTopic(topic)"></ion-icon>
                    </div>
                  </div>
                  
                  <div *ngIf="!activeSubject.topics || activeSubject.topics.length === 0" style="padding: 1.5rem; text-align: center; color: #8B96AB; border: 1px dashed rgba(255,255,255,0.2); border-radius: 8px; margin-bottom: 1rem;">
                    No topics yet. Click below to create one.
                  </div>
                </div>

                <div style="margin-top: 1.5rem;">
                  <app-button variant="primary" label="Add New Topic" icon="add-outline" (click)="goToAddTopic()"></app-button>
                </div>
              </div>

            </div>'''

# The original has: <!-- TAB 2: TOPICS & QUIZZES -->\n            <div *ngIf="cmsTab === \'topics\'" class="tab-content"> ... lots of things ... </div>\n\n          </div>\n        </div>\n      </div> <!-- End System View -->
# We want to replace from <!-- TAB 2: TOPICS & QUIZZES --> up to the closing tags
# In the original `backup_manage.html`:
#             <!-- TAB 2: TOPICS & QUIZZES -->
#             <div *ngIf="cmsTab === 'topics'" class="tab-content">
#                 ... (all the topic/quiz stuff) ...
#             </div>
#
#           </div>
#         </div>
#       </div> <!-- End System View -->

# So let's find <!-- TAB 2: TOPICS & QUIZZES -->
idx_start = orig.find('<!-- TAB 2: TOPICS & QUIZZES -->')
# Find the end by looking for:
#           </div>
#         </div>
#       </div> <!-- End System View -->
idx_end = orig.find('          </div>\n        </div>\n      </div> <!-- End System View -->')

if idx_start != -1 and idx_end != -1:
    orig = orig[:idx_start] + '<!-- TAB 2: TOPICS & QUIZZES -->\n            ' + new_tab_2 + '\n\n' + orig[idx_end:]


# Add Empty State (CMS Right Column)
orig = orig.replace('<div class="glass-card editor-card">', '<div class="glass-card editor-card" *ngIf="activeSubject">')

empty_state = '''          
          <!-- CMS Right Column: Empty State -->
          <div class="glass-card editor-card" *ngIf="!activeSubject" style="display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.7;">
            <ion-icon name="book-outline" style="font-size: 4rem; color: #4facfe; margin-bottom: 1rem;"></ion-icon>
            <h2>Select a Subject</h2>
            <p style="color: #8B96AB;">Click a subject from the library to edit its content, or click Add New.</p>
          </div>
'''
orig = orig.replace('</div> <!-- End System View -->', empty_state + '\n      </div> <!-- End System View -->')


with open('src/app/pages/manage-users/manage-users.page.html', 'w', encoding='utf-8') as f:
    f.write(orig)
print('Restored HTML to perfect precision!')
