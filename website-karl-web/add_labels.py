
import re

with open('src/app/pages/manage-users/manage-users.page.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the quiz-choices block to add A, B, C, D labels
new_choices = '''<div class="quiz-choices">
                        <div class="choice correct-choice">
                          <input type="radio" checked name="q1" />
                          <span class="choice-label">A</span>
                          <input type="text" value="2x" class="dummy-input" />
                        </div>
                        <div class="choice">
                          <input type="radio" name="q1" />
                          <span class="choice-label">B</span>
                          <input type="text" value="x" class="dummy-input" />
                        </div>
                        <div class="choice">
                          <input type="radio" name="q1" />
                          <span class="choice-label">C</span>
                          <input type="text" value="x^2" class="dummy-input" />
                        </div>
                        <div class="choice">
                          <input type="radio" name="q1" />
                          <span class="choice-label">D</span>
                          <input type="text" value="2" class="dummy-input" />
                        </div>
                      </div>'''

html = re.sub(r'<div class="quiz-choices">[\s\S]*?</div>\s*</div>', new_choices + '\n                      </div>', html)

with open('src/app/pages/manage-users/manage-users.page.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Updated HTML with choice labels')
