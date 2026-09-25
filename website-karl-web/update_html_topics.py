import re

with open('src/app/pages/manage-users/manage-users.page.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_tab_2 = """
            <!-- TAB 2: TOPICS & QUIZZES -->
            <div *ngIf="cmsTab === 'topics'" class="tab-content">
              
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

            </div>
"""

# Replace the entire TAB 2 block. 
# In the current HTML, TAB 2 starts with <!-- TAB 2: TOPICS & QUIZZES --> and ends with the closing div of the editor-card.
html = re.sub(r'<!-- TAB 2: TOPICS & QUIZZES -->[\s\S]*?(?=<!-- CMS Right Column: Empty State -->)', new_tab_2 + '\n          </div>\n          ', html)

with open('src/app/pages/manage-users/manage-users.page.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Updated HTML to simplify Topics tab')
