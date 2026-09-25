
import re

with open('src/app/pages/manage-users/manage-users.page.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Update Content Library (Left Column)
list_replacement = '''          <!-- CMS Left Column: List -->
          <div class="glass-card list-card">
            <h2>Content Library</h2>
            <div class="placeholder-list">
              <div class="list-item" 
                   *ngFor="let subject of subjectsList"
                   [class.active]="activeSubject?.id === subject.id"
                   (click)="selectSubject(subject)">
                {{ subject.title || 'Untitled Subject' }}
              </div>
              <div class="list-item add-new" (click)="addNewSubject()">+ Add New Subject</div>
            </div>
          </div>'''

# Extract and replace the list card
html = re.sub(r'<!-- CMS Left Column: List -->[\s\S]*?<!-- CMS Right Column: Editor -->', list_replacement + '\n          \n          <!-- CMS Right Column: Editor -->', html)


# Wrap Editor in activeSubject check and bind forms
editor_top = '''          <!-- CMS Right Column: Editor -->
          <div class="glass-card editor-card" *ngIf="activeSubject">
            <div class="editor-header">
              <h2>{{ activeSubject.id ? 'Edit Subject' : 'New Subject' }}</h2>'''

html = re.sub(r'<!-- CMS Right Column: Editor -->\s*<div class="glass-card editor-card">\s*<div class="editor-header">\s*<h2>Edit Subject</h2>', editor_top, html)


# Bind inputs
form_html = '''              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
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

html = re.sub(r'<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">[\s\S]*?</div>\s*</div>\s*<!-- TAB 2: TOPICS & QUIZZES -->', form_html + '\n            </div>\n\n            <!-- TAB 2: TOPICS & QUIZZES -->', html)

# Add an empty state if no subject is selected
empty_state = '''          <!-- CMS Right Column: Empty State -->
          <div class="glass-card editor-card" *ngIf="!activeSubject" style="display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.7;">
            <ion-icon name="book-outline" style="font-size: 4rem; color: #4facfe; margin-bottom: 1rem;"></ion-icon>
            <h2>Select a Subject</h2>
            <p style="color: #8B96AB;">Click a subject from the library to edit its content, or click Add New.</p>
          </div>
'''
html = html.replace('</div> <!-- End System View -->', '</div>\n' + empty_state + '\n      </div> <!-- End System View -->')

with open('src/app/pages/manage-users/manage-users.page.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('HTML Updated with Subject Binding')
