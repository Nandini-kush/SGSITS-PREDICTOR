import { Info } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="mt-8 rounded-3xl border-l-4 border-blue-500 bg-sky-100/90 shadow-sm shadow-slate-300/40 p-6 sm:p-8 text-slate-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 shadow-sm shadow-blue-500/10">
          <Info className="h-6 w-6" />
        </div>

        <div className="space-y-4">
          <div className="space-y-3 text-sm sm:text-base leading-7 font-medium">
            <p className="text-slate-900">
              <span className="font-semibold">Special Note:</span> This prediction is based on the analysis of the last five years of admission data using an AI-based machine learning model. The result is intended for guidance and reference purposes only. It does not guarantee admission to SGSITS Indore, as actual cutoffs may vary depending on seat availability, category competition, applicant preferences, and admission policies.
            </p>
            <p className="text-slate-700">
              विशेष सूचना: यह भविष्यवाणी पिछले पाँच वर्षों के प्रवेश डेटा के विश्लेषण पर आधारित एक AI एवं Machine Learning मॉडल द्वारा तैयार की गई है। यह केवल मार्गदर्शन हेतु है और SGSITS इंदौर में प्रवेश की गारंटी नहीं देती है क्योंकि वास्तविक कटऑफ सीट उपलब्धता, श्रेणी प्रतिस्पर्धा, अभ्यर्थी प्राथमिकताओं और प्रवेश नीति पर निर्भर करती है।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
