from kivy.app import App
from kivy.clock import Clock
from kivy.graphics import Color, Ellipse, Line
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.textinput import TextInput
from kivy.uix.button import Button
from kivy.uix.widget import Widget

class AtlasFace(Widget):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.talking = False
        self.phase = 0
        Clock.schedule_interval(self.animate, 0.18)
        self.bind(pos=self.draw_face, size=self.draw_face)
        self.draw_face()

    def animate(self, dt):
        if self.talking:
            self.phase = (self.phase + 1) % 3
            self.draw_face()

    def draw_face(self, *args):
        self.canvas.clear()
        with self.canvas:
            Color(0.02, 0.05, 0.12, 1)
            Ellipse(pos=self.pos, size=self.size)

            w, h = self.width, self.height
            x, y = self.x, self.y

            Color(0.0, 0.85, 1.0, 1)
            Line(circle=(x+w/2, y+h*0.55, min(w,h)*0.31), width=2)

            Color(0.1, 0.8, 1, 1)
            Ellipse(pos=(x+w*0.30, y+h*0.59), size=(w*0.12, h*0.07))
            Ellipse(pos=(x+w*0.58, y+h*0.59), size=(w*0.12, h*0.07))

            Color(0.2, 0.95, 1, 1)
            mouth_h = h * (0.025 + 0.045 * self.phase if self.talking else 0.02)
            Line(
                rectangle=(
                    x+w*0.38, y+h*0.39,
                    w*0.24, mouth_h
                ),
                width=2
            )

class AtlasApp(App):
    def build(self):
        self.title = "ATLAS AI"
        root = BoxLayout(orientation="vertical", padding=16, spacing=10)

        title = Label(
            text="[b]ATLAS AI[/b]\\nYour personal AI assistant",
            markup=True, size_hint_y=0.13
        )
        root.add_widget(title)

        self.face = AtlasFace(size_hint_y=0.43)
        root.add_widget(self.face)

        self.status = Label(
            text="Hello, Boss! ATLAS is ready.",
            size_hint_y=0.10
        )
        root.add_widget(self.status)

        self.question = TextInput(
            hint_text="Type your question here...",
            multiline=False, size_hint_y=0.12
        )
        root.add_widget(self.question)

        buttons = BoxLayout(size_hint_y=0.13, spacing=8)
        ask = Button(text="Ask ATLAS")
        ask.bind(on_press=self.ask_atlas)
        speak = Button(text="Test Voice")
        speak.bind(on_press=self.test_voice)
        buttons.add_widget(ask)
        buttons.add_widget(speak)
        root.add_widget(buttons)

        self.answer = Label(
            text="Your answer will appear here.",
            size_hint_y=0.19
        )
        root.add_widget(self.answer)
        return root

    def ask_atlas(self, instance):
        text = self.question.text.strip()
        if not text:
            self.status.text = "Type a question first."
            return

        self.status.text = "ATLAS received your question."
        self.answer.text = (
            "I received: " + text +
            "\\nAI brain connection will be added next."
        )

    def test_voice(self, instance):
        self.status.text = "Voice test requested."
        try:
            from plyer import tts
            self.face.talking = True
            tts.speak("Hello Boss. I am Atlas.")
            Clock.schedule_once(self.stop_talking, 2)
        except Exception:
            self.status.text = "Voice support needs Android setup."
            self.face.talking = False

    def stop_talking(self, dt):
        self.face.talking = False
        self.face.draw_face()

if __name__ == "__main__":
    AtlasApp().run()
