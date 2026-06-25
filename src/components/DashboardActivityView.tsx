import { Pen, Flame, Footprints, Moon, Droplets } from "lucide-react";
import React, { useState, useEffect } from "react";
import { globalSocket } from "@/App";

function TrainingCalendar({ activities }: { activities: any[] }) {
  const allDays = Array.from({ length: 35 }, (_, i) => {
    // 35 cells for calendar view
    const date = new Date();
    date.setDate(date.getDate() - (34 - i));
    
    // Check if there is an activity on this date
    const dayActivities = activities.filter(a => {
      const aDate = new Date(a.time);
      return aDate.getDate() === date.getDate() && aDate.getMonth() === date.getMonth();
    });

    let activityType = null;
    let color = "";
    
    if (dayActivities.length > 0) {
      const act = dayActivities[0];
      if (act.activity.toLowerCase().includes('run')) {
        activityType = 'Run'; color = "bg-[#32ADE6]";
      } else if (act.activity.toLowerCase().includes('lift')) {
        activityType = 'Lift'; color = "bg-[#FFB300]";
      } else if (act.activity.toLowerCase().includes('yoga')) {
        activityType = 'Yoga'; color = "bg-[#9D74FF]";
      } else {
        activityType = 'Other'; color = "bg-[#34C759]";
      }
    }
    
    return {
      day: date.getDate(),
      activityType,
      color,
      isEmpty: false // We fill all cells with actual dates for simplicity
    };
  });

  return (
    <div className="mt-8 mb-4 bg-[#1A1A1A] border border-[#2A2D3A]/50 rounded-[24px] p-6 shadow-sm shrink-0 w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-bold text-lg tracking-tight">Activity Calendar</h3>
        <div className="flex flex-wrap justify-end gap-2 text-[10px] sm:text-xs text-[#8E92A4]">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#32ADE6]" /> Run</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#FFB300]" /> Lift</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#9D74FF]" /> Yoga</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#34C759]" /> Other</div>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-xs font-semibold text-[#8E92A4] pb-2">{d}</div>
        ))}
        {allDays.map((d, i) => (
          <div key={i} className="aspect-square flex items-center justify-center relative">
            <div className="w-full h-full rounded-xl flex items-center justify-center relative border border-transparent hover:border-[#8E92A4]/30 bg-[#22252E] transition-colors cursor-pointer group">
              <span className={`text-sm font-medium z-10 ${d.activityType ? 'text-white' : 'text-[#8E92A4]'}`}>{d.day}</span>
              {d.color && (
                <div className={`absolute bottom-1.5 sm:bottom-2 w-1.5 h-1.5 rounded-full ${d.color} shadow-sm group-hover:scale-150 transition-transform`} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardActivityView({ currentUser }: { currentUser?: any }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);

  useEffect(() => {
    if (globalSocket) {
      globalSocket.on('dashboard_data_update', (data: any[]) => {
        setActivities(data);
        const calories = data.reduce((acc, act) => acc + (act.details?.calories || 0), 0);
        setTotalCalories(calories);
      });
      globalSocket.emit('fetch_initial_data');
    }
    return () => {
      globalSocket?.off('dashboard_data_update');
    };
  }, []);

  const chartData = [
    { day: "S", value: 30, isActive: false },
    { day: "M", value: 15, isActive: false },
    { day: "T", value: 10, isActive: false },
    { day: "W", value: 40, isActive: true },
    { day: "T", value: 25, isActive: false },
    { day: "F", value: 20, isActive: false },
    { day: "S", value: 10, isActive: false },
  ];

  return (
    <div className="p-6 md:p-8 max-w-xl mx-auto w-full pb-24 md:pb-10 overflow-y-auto h-full flex flex-col hide-scrollbar">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 shrink-0 pt-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Today <Pen className="w-4 h-4 text-[#8E92A4] cursor-pointer hover:text-white transition-colors" />
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <img 
             src={currentUser?.profilePic || "https://i.pravatar.cc/150"} 
             alt="User avatar" 
             className="w-10 h-10 rounded-full border-2 border-brand-bg object-cover shadow-sm bg-gray-800"
          />
        </div>
      </header>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-4 mb-10 shrink-0">
        <div className="bg-[#1C1A14] border border-[#2B2412] rounded-[24px] p-5 relative overflow-hidden group hover:border-[#FFB300]/50 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <span className="text-white font-medium">Calories</span>
            <div className="w-6 h-6 bg-[#FFB300] rounded-full flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-white fill-white" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1 tracking-tight">{totalCalories}</div>
            <div className="text-[#8E92A4] text-xs">Kcal</div>
          </div>
        </div>

        <div className="bg-[#1A1826] border border-[#241F3A] rounded-[24px] p-5 relative overflow-hidden group hover:border-[#9D74FF]/50 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <span className="text-white font-medium">Steps</span>
            <div className="w-6 h-6 bg-[#9D74FF] rounded-full flex items-center justify-center">
              <Footprints className="w-3.5 h-3.5 text-white fill-white" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1 tracking-tight">1000</div>
            <div className="text-[#8E92A4] text-xs">Steps</div>
          </div>
        </div>

        <div className="bg-[#14201A] border border-[#1B3224] rounded-[24px] p-5 relative overflow-hidden group hover:border-[#34C759]/50 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <span className="text-white font-medium">Sleep</span>
            <div className="w-6 h-6 bg-[#34C759] rounded-full flex items-center justify-center">
              <Moon className="w-3.5 h-3.5 text-white fill-white" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1 tracking-tight">6 hr</div>
            <div className="text-[#8E92A4] text-xs">Hours</div>
          </div>
        </div>

        <div className="bg-[#141E26] border border-[#182C3A] rounded-[24px] p-5 relative overflow-hidden group hover:border-[#32ADE6]/50 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <span className="text-white font-medium">Water</span>
            <div className="w-6 h-6 bg-[#32ADE6] rounded-full flex items-center justify-center">
              <Droplets className="w-3.5 h-3.5 text-white fill-white" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1 tracking-tight">2 lits</div>
            <div className="text-[#8E92A4] text-xs">Liters</div>
          </div>
        </div>
      </div>

      {/* Workout Chart */}
      <section className="shrink-0 w-full mb-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Workout</h3>
            <div className="text-2xl font-bold text-white flex items-baseline gap-1 tracking-tight">
              40 <span className="text-sm text-[#8E92A4] font-medium tracking-normal">min</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm text-[#8E92A4] block mb-1">Weekly Average</span>
            <div className="text-xl font-bold text-white flex items-baseline gap-1 justify-end tracking-tight">
              30 <span className="text-sm text-[#8E92A4] font-medium tracking-normal">min</span>
            </div>
          </div>
        </div>
        
        <div className="relative h-40 w-full mt-10">
          {/* Dashed background line */}
          <div className="absolute left-0 right-0 top-2/3 border-t-2 border-dashed border-[#8E92A4]/30 z-0 flex items-center">
            {/* Dots on the line to match screenshot exactly */}
            {chartData.map((_, i) => (
               <div key={i} className={`absolute w-1.5 h-1.5 bg-[#8E92A4] rounded-full z-10 transition-colors`} style={{ left: `calc(${(i / (chartData.length - 1)) * 100}% - 3px)`}}></div>
            ))}
          </div>

          <div className="flex justify-between items-end h-full relative z-10 px-0.5">
            {chartData.map((data, i) => (
               <div key={i} className="flex flex-col items-center gap-4 relative h-full justify-end group">
                 {/* Tall thin bar container to match screenshot visual */}
                 <div className="w-1.5 h-full bg-[#2A2D3A] rounded-t-full absolute bottom-0"></div>
                 {/* Active bar */}
                 <div 
                   className={`w-1.5 rounded-t-full absolute bottom-0 shadow-[0_0_10px_rgba(255,107,0,0.5)] transition-all`}
                   style={{ 
                     height: `${(data.value / 40) * 100}%`,
                     backgroundColor: '#FF6B00',
                   }}
                 ></div>
                 
                 {/* Invisible hit box for hover effect */}
                 <div className="absolute inset-0 w-8 -ml-4 cursor-pointer"></div>
               </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 px-0.5">
           {chartData.map((data, i) => (
              <span key={i} className="text-[#8E92A4] text-xs font-semibold w-1.5 text-center flex justify-center">
                {data.day}
              </span>
           ))}
        </div>
      </section>

      {/* Performance Comparison Widget */}
      <section className="shrink-0 w-full mb-6">
        <div className="bg-[#1A1A1A] border border-[#2A2D3A]/50 rounded-[24px] p-6 shadow-sm group hover:border-[#21D4B5]/50 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-white font-bold text-lg tracking-tight mb-1">Weekly Performance</h3>
              <p className="text-[#8E92A4] text-xs">Vs. Previous Week</p>
            </div>
            <div className="bg-[#21D4B5]/10 text-[#21D4B5] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <span className="text-lg">↑</span> 12%
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[#8E92A4] text-xs mb-1">Distance</div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">42.5</span>
                <span className="text-sm text-[#8E92A4] pb-1">km</span>
              </div>
              <div className="text-[10px] text-[#34C759] mt-1">+3.2 km</div>
            </div>
            <div>
              <div className="text-[#8E92A4] text-xs mb-1">Avg Pace</div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">5:20</span>
                <span className="text-sm text-[#8E92A4] pb-1">/km</span>
              </div>
              <div className="text-[10px] text-[#34C759] mt-1">-0:15 /km</div>
            </div>
          </div>
          
          {/* Simple comparison bar */}
          <div className="mt-6">
            <div className="flex justify-between text-[10px] text-[#8E92A4] mb-2">
              <span>This Week</span>
              <span>Last Week</span>
            </div>
            <div className="h-2 w-full bg-[#22252E] rounded-full overflow-hidden flex">
              <div className="h-full bg-[#21D4B5] rounded-l-full" style={{ width: '56%' }}></div>
              <div className="h-full bg-[#32ADE6] rounded-r-full" style={{ width: '44%' }}></div>
            </div>
          </div>
        </div>
      </section>

      <TrainingCalendar activities={activities} />
    </div>
  );
}
