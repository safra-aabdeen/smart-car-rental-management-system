import os

files = [
    r"c:\final project\car-rent\src\pages\AdminManageCars.jsx",
    r"c:\final project\car-rent\src\pages\AdminDriver.jsx",
    r"c:\final project\car-rent\src\pages\AdminUser.jsx",
    r"c:\final project\car-rent\src\pages\AdminMessages.jsx",
    r"c:\final project\car-rent\src\pages\AdminReviews.jsx",
]

def apply_theme(text):
    # Page bg
    text = text.replace('className="flex min-h-screen bg-gray-100"', 'className="flex min-h-screen bg-[#0a0f1e]"')
    
    # Headings
    text = text.replace('text-gray-800', 'text-white')
    text = text.replace('text-3xl font-bold', 'text-3xl font-bold text-white')
    text = text.replace('text-4xl font-bold', 'text-4xl font-bold text-white')
    text = text.replace('text-5xl font-bold', 'text-5xl font-bold text-white')
    text = text.replace('text-3xl font-bold text-white text-white', 'text-3xl font-bold text-white')
    text = text.replace('text-4xl font-bold text-white text-white', 'text-4xl font-bold text-white')
    text = text.replace('text-5xl font-bold text-white text-white', 'text-5xl font-bold text-white')
    text = text.replace('text-2xl font-bold', 'text-2xl font-bold text-white')
    text = text.replace('text-2xl font-bold text-white text-white', 'text-2xl font-bold text-white')
    
    # Add/action buttons
    text = text.replace('bg-blue-600 hover:bg-blue-700', 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500')
    text = text.replace('bg-blue-600 text-white flex-1 p-2 rounded', 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white flex-1 p-2 rounded')
    text = text.replace('bg-blue-600 text-white px-5 py-2', 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-5 py-2')
    text = text.replace('hover:bg-blue-700 text-white', 'hover:from-emerald-400 hover:to-teal-500 text-white')
    
    # Tables & Cards
    text = text.replace('bg-white rounded-xl shadow-sm overflow-hidden', 'bg-slate-900/80 border border-slate-800/60 rounded-2xl overflow-hidden')
    text = text.replace('bg-white rounded-xl shadow overflow-hidden', 'bg-slate-900/80 border border-slate-800/60 rounded-2xl overflow-hidden shadow')
    text = text.replace('bg-white p-6 rounded-2xl shadow-md', 'bg-slate-900/80 border border-slate-800/60 p-6 rounded-2xl shadow-md')
    text = text.replace('bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md', 'bg-slate-900/80 p-6 rounded-2xl shadow-sm border border-slate-800/60 hover:shadow-md hover:bg-slate-800/40')
    
    # Table header
    text = text.replace('bg-gray-50 border-b', 'bg-slate-800/60 border-b border-slate-700')
    text = text.replace('bg-gray-50', 'bg-slate-800/60 border-b border-slate-700')
    
    # Table header text
    text = text.replace('text-gray-600 font-bold', 'text-slate-400 font-semibold')
    text = text.replace('text-gray-600', 'text-slate-400')
    
    # Table rows
    text = text.replace('border-b hover:bg-gray-50', 'border-b border-slate-800/60 hover:bg-slate-800/40')
    text = text.replace('border-t hover:bg-gray-50', 'border-t border-slate-800/60 hover:bg-slate-800/40')
    text = text.replace('border-t hover:bg-slate-800/60 border-b border-slate-700', 'border-t border-slate-800/60 hover:bg-slate-800/40')
    text = text.replace('border-t', 'border-t border-slate-800/60')
    text = text.replace('border-t border-slate-800/60 hover:bg-slate-800/40 border-slate-800/60', 'border-t border-slate-800/60 hover:bg-slate-800/40')
    text = text.replace('border-t border-slate-800/60 border-slate-800/60', 'border-t border-slate-800/60')
    text = text.replace('border-t border-slate-800/60 hover:bg-slate-800/60 border-b border-slate-700', 'border-t border-slate-800/60 hover:bg-slate-800/40')

    # Cell text
    text = text.replace('text-gray-900', 'text-white')
    text = text.replace('text-slate-800', 'text-white')
    text = text.replace('text-gray-700', 'text-slate-300')
    text = text.replace('text-gray-500', 'text-slate-400')
    
    # Status badges
    text = text.replace('bg-green-100 text-green-700', 'bg-emerald-500/20 text-emerald-400')
    text = text.replace('bg-red-100 text-red-700', 'bg-red-500/20 text-red-400')
    text = text.replace('bg-yellow-100 text-yellow-700', 'bg-yellow-500/20 text-yellow-400')
    text = text.replace('bg-blue-100 text-blue-700', 'bg-blue-500/20 text-blue-400')
    
    # Icons & Actions
    text = text.replace('text-blue-600 hover:text-blue-800', 'text-emerald-400 hover:text-emerald-300')
    text = text.replace('text-red-600 hover:text-red-800', 'text-red-400 hover:text-red-300')
    text = text.replace('text-red-500 hover:text-red-700', 'text-red-400 hover:text-red-300')
    text = text.replace('text-blue-500 hover:text-blue-700', 'text-emerald-400 hover:text-emerald-300')
    text = text.replace('text-blue-600', 'text-emerald-400')
    text = text.replace('text-red-600', 'text-red-400')
    
    # Modal overlay
    text = text.replace('bg-black bg-opacity-50', 'bg-black/70 backdrop-blur-sm')
    text = text.replace('bg-black/50', 'bg-black/70 backdrop-blur-sm')
    
    # Modal panel
    text = text.replace('bg-white rounded-2xl p-6', 'bg-slate-900 border border-slate-700 rounded-2xl p-6')
    text = text.replace('bg-white p-6 rounded-xl w-[400px]', 'bg-slate-900 border border-slate-700 p-6 rounded-xl w-[400px]')
    
    # Inputs
    text = text.replace('w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none', 'w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none')
    text = text.replace('w-full border p-2 rounded', 'w-full bg-slate-800/80 border border-slate-700 rounded-xl p-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none')
    text = text.replace('w-full pl-12 pr-4 py-3 border rounded-xl outline-none focus:border-blue-500', 'w-full bg-slate-900/80 border border-slate-800/60 pl-12 pr-4 py-3 rounded-xl outline-none focus:border-emerald-500 text-white placeholder-slate-500')
    text = text.replace('border rounded-xl px-4 py-3 outline-none focus:border-blue-500 bg-white', 'bg-slate-900/80 border border-slate-800/60 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 text-slate-300')
    text = text.replace('w-full md:w-96 px-6 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm', 'w-full md:w-96 bg-slate-900/80 border border-slate-800/60 px-6 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-slate-500 shadow-sm')
    text = text.replace('w-full border p-4 rounded-xl outline-none resize-none focus:border-blue-500', 'w-full bg-slate-800/80 border border-slate-700 p-4 rounded-xl outline-none resize-none focus:border-emerald-500 text-white placeholder-slate-500')
    
    # AdminMessage specific
    text = text.replace('bg-slate-950 text-white p-6', 'bg-slate-900/90 border-b border-slate-800/60 text-white p-6')
    text = text.replace('bg-white rounded-2xl shadow-2xl', 'bg-slate-900 border border-slate-800/60 rounded-2xl shadow-2xl')
    text = text.replace('bg-gray-50 rounded-xl p-4', 'bg-slate-900/80 border border-slate-800/60 rounded-xl p-4')
    text = text.replace('bg-white rounded-lg p-3 border', 'bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-slate-300')
    text = text.replace('bg-green-50 rounded-lg p-3 border border-green-200', 'bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20')
    text = text.replace('text-green-600 font-semibold', 'text-emerald-400 font-semibold')
    text = text.replace('bg-blue-100', 'bg-emerald-500/20')
    text = text.replace('bg-green-100', 'bg-emerald-500/20')
    text = text.replace('bg-yellow-100', 'bg-yellow-500/20')
    text = text.replace('text-yellow-600', 'text-yellow-400')
    text = text.replace('text-blue-600', 'text-emerald-400')
    text = text.replace('text-green-600', 'text-emerald-400')
    
    # Review list specific
    text = text.replace('bg-red-50 hover:bg-red-100', 'bg-red-500/10 hover:bg-red-500/20')
    
    # Buttons
    text = text.replace('bg-blue-600 text-white', 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500')
    text = text.replace('bg-gray-300 text-gray-800 hover:bg-gray-400', 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700')
    text = text.replace('bg-gray-300 flex-1 p-2 rounded', 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 flex-1 p-2 rounded')
    
    return text

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    new_content = apply_theme(content)
    with open(f, 'w', encoding='utf-8') as file:
        file.write(new_content)
    print(f"Updated {f}")
