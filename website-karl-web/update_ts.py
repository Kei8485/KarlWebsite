import re

with open('src/app/pages/manage-users/manage-users.page.ts', 'r', encoding='utf-8') as f:
    ts = f.read()

if 'import { Router }' not in ts:
    ts = ts.replace("import { HttpClient } from '@angular/common/http';", "import { HttpClient } from '@angular/common/http';\nimport { Router } from '@angular/router';")
    ts = ts.replace("private modalCtrl = inject(ModalController);", "private modalCtrl = inject(ModalController);\n  private router = inject(Router);")

nav_methods = """
  goToAddTopic() {
    if (!this.activeSubject || !this.activeSubject.id) return;
    this.router.navigate(['/manage-topic', this.activeSubject.id, 'new']);
  }

  goToEditTopic(topicId: number) {
    if (!this.activeSubject || !this.activeSubject.id) return;
    this.router.navigate(['/manage-topic', this.activeSubject.id, topicId]);
  }
  
  async deleteTopic(topic: any) {
    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      cssClass: 'transparent-modal',
      componentProps: {
        title: 'Delete Topic',
        message: `Are you sure you want to permanently delete <strong>${topic.title}</strong>? All quizzes inside it will be lost.`,
        confirmText: 'Delete',
        isDanger: true
      }
    });
    
    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    if (data === true) {
      this.http.delete(`${this.apiSystemUrl}/topics/manage/${topic.id}/`).subscribe({
        next: () => this.loadSubjects(),
        error: (err) => console.error(err)
      });
    }
  }
"""

if 'goToAddTopic' not in ts:
    ts = ts.replace('toggleQuizEditor(topicId: number) {', nav_methods + '\n  toggleQuizEditor(topicId: number) {')

with open('src/app/pages/manage-users/manage-users.page.ts', 'w', encoding='utf-8') as f:
    f.write(ts)
print('Updated TS with router and topic methods')
