import { useState } from "react";
import { Upload, FileText, CheckCircle, Paperclip, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const assignments = [
  { id: 1, title: "Fractions & Decimals Quiz", subject: "Math" },
  { id: 2, title: "Photosynthesis Report", subject: "Science" },
  { id: 3, title: "Book Review: Wonder", subject: "English" },
];

const SubmitScreen = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [file, setFile] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedId && file) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedId(null);
        setFile(null);
        setNote("");
      }, 2500);
    }
  };

  return (
    <div className="px-4 pt-6 pb-28 max-w-md mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-foreground mb-1">Submit Work</h1>
        <p className="text-sm text-muted-foreground mb-6">Choose an assignment and upload your work</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-20 h-20 rounded-full gradient-success flex items-center justify-center mb-4">
              <CheckCircle size={36} className="text-success-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Submitted! 🎉</h2>
            <p className="text-sm text-muted-foreground mt-1">+50 XP earned</p>
          </motion.div>
        ) : (
          <motion.div key="form" className="space-y-4">
            {/* Assignment Selection */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Select Assignment
              </label>
              <div className="space-y-2">
                {assignments.map((a) => (
                  <motion.button
                    key={a.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedId(a.id)}
                    className={`w-full glass-card rounded-xl p-3.5 text-left flex items-center gap-3 transition-all ${
                      selectedId === a.id ? "ring-2 ring-primary border-primary/30" : ""
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      selectedId === a.id ? "gradient-primary" : "bg-muted"
                    }`}>
                      <FileText size={15} className={selectedId === a.id ? "text-primary-foreground" : "text-muted-foreground"} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{a.title}</p>
                      <p className="text-[11px] text-muted-foreground">{a.subject}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Upload File
              </label>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setFile("homework.pdf")}
                className={`w-full rounded-xl border-2 border-dashed p-6 flex flex-col items-center gap-2 transition-colors ${
                  file ? "border-success bg-success/5" : "border-border hover:border-primary/40"
                }`}
              >
                {file ? (
                  <>
                    <Paperclip size={20} className="text-success" />
                    <span className="text-sm font-semibold text-success">{file}</span>
                    <span className="text-[11px] text-muted-foreground">Tap to change</span>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Tap to upload</span>
                    <span className="text-[11px] text-muted-foreground">PDF, DOC, or image</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Note */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Add a Note (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any comments for your teacher..."
                rows={3}
                className="w-full rounded-xl bg-card border border-border p-3 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={!selectedId || !file}
              className={`w-full rounded-xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                selectedId && file
                  ? "gradient-primary text-primary-foreground shadow-lg"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Send size={16} />
              Submit Assignment
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubmitScreen;
