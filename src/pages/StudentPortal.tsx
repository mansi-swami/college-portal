import MultiStepForm from "../components/ApplicationForm/MultiStepForm";
import ChatWindow from "../components/ChatBot/ChatWindow";
import VideoPlayer from "../components/VideoTutorial/VideoPlayer";

export default function Student() {
  return (
    <div className="space-y-6">
      <section aria-labelledby="apply-heading" className="grid md:grid-cols-2 gap-6">
        <h2 id="apply-heading" className="sr-only">Apply and Chat</h2>
        <MultiStepForm />
        <ChatWindow />
      </section>

      <section aria-labelledby="tutorial-heading" className="mt-6">
        <h2 id="tutorial-heading" className="sr-only">Tutorial</h2>
        <VideoPlayer />
      </section>
    </div>
  );
}
