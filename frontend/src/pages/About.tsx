import { useEffect, useState } from 'react';
import { Navbar, Footer } from '@/components/layout/Navigation';
import { api } from '@/services/api';
import { LawyerProfile } from '@/types';

export default function About() {
  const [profile, setProfile] = useState<LawyerProfile | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await api.public.getLawyerProfile();
      if (res.success) setProfile(res.data);
    };
    load();
  }, []);

  if (!profile) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-wide px-4 md:px-6 py-20 pt-32">
         <h1 className="text-4xl md:text-5xl font-serif font-bold mb-12 text-center">About {profile.firmName || 'Eka Legal Consultancy'}</h1>
         
         <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="relative">
               <div className="absolute inset-0 bg-accent/10 rounded-2xl transform rotate-3"></div>
               <img 
                 src={profile.photoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=600&fit=crop"} 
                 alt={profile.name} 
                 className="relative rounded-2xl shadow-xl object-cover w-full h-[600px]" 
               />
            </div>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-serif font-bold text-foreground">{profile.name}</h2>
                <p className="text-xl text-accent font-medium mt-2">{profile.title}</p>
              </div>
              
              <div className="prose prose-lg text-muted-foreground">
                <p className="whitespace-pre-line">{profile.bio}</p>
              </div>
              
              <div className="pt-8 border-t">
                <h3 className="text-xl font-bold mb-4 font-serif">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="font-semibold w-20">Email:</span>
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-semibold w-20">Phone:</span>
                    <span>{profile.phone}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-semibold w-20">Address:</span>
                    <span className="whitespace-pre-line">{profile.address}</span>
                  </div>
                </div>
              </div>

               <div className="pt-8">
                 <h3 className="text-xl font-bold mb-4 font-serif">Credentials & Areas of Practice</h3>
                 <div className="grid gap-4">
                    <div>
                        <h4 className="font-semibold mb-2">Practice Areas</h4>
                        <div className="flex flex-wrap gap-2">
                            {profile.practiceAreas.map((area, i) => (
                                <span key={i} className="px-3 py-1 bg-secondary rounded-full text-sm">{area}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Credentials</h4>
                        <ul className="list-disc list-inside text-muted-foreground">
                            {profile.credentials.map((cred, i) => (
                                <li key={i}>{cred}</li>
                            ))}
                        </ul>
                    </div>
                 </div>
               </div>
            </div>
         </div>
      </div>
      <Footer />
    </div>
  );
}
