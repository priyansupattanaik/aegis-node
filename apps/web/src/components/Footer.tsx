'use client';

export default function Footer() {
  return (
    <footer id="footer" className="border-t border-white/[0.05] py-14 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <span className="text-blue-400 text-xs font-black">A</span>
              </div>
              <span className="font-black text-white text-base tracking-tight">
                Aegis<span className="text-blue-400">Node</span>
              </span>
            </div>
            <p className="text-xs text-gray-600 max-w-xs leading-relaxed">
              Windows npm security middleware for AI-assisted development.
              Open-source, no telemetry, no accounts.
            </p>
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-16 gap-y-3 text-sm text-gray-600">
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</p>
              <a href="#how-it-works" className="block hover:text-gray-300 transition-colors">How It Works</a>
              <a href="#demo" className="block hover:text-gray-300 transition-colors">Live Scanner</a>
              <a href="#install" className="block hover:text-gray-300 transition-colors">Install</a>
            </div>
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Docs</p>
              <a href="/docs" className="block hover:text-gray-300 transition-colors">Documentation</a>
              <a href="/docs#cli-reference" className="block hover:text-gray-300 transition-colors">CLI Reference</a>
              <a href="/docs#api-reference" className="block hover:text-gray-300 transition-colors">API Reference</a>
            </div>
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Links</p>
              <a href="https://github.com/your-username/aegisnode" target="_blank" rel="noopener noreferrer" className="block hover:text-gray-300 transition-colors">GitHub</a>
              <a href="https://www.npmjs.com/package/aegisnode" target="_blank" rel="noopener noreferrer" className="block hover:text-gray-300 transition-colors">npm Package</a>
              <a href="https://github.com/your-username/aegisnode/issues" target="_blank" rel="noopener noreferrer" className="block hover:text-gray-300 transition-colors">Report Issue</a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.04] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-700">
            © {new Date().getFullYear()} AegisNode. Released under the MIT License.
          </p>
          <p className="text-xs text-gray-700">
            No telemetry · No accounts · No subscriptions · Free forever
          </p>
        </div>
      </div>
    </footer>
  );
}
