import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { 
  useGetMyProfile, useGetAdminDashboard, useListShows, useCreateShow, useUpdateShow, useDeleteShow, useListUsers, useListAllPurchases 
} from "@workspace/api-client-react";
import { 
  getGetMyProfileQueryKey, getGetAdminDashboardQueryKey, getListShowsQueryKey, getListUsersQueryKey, getListAllPurchasesQueryKey 
} from "@workspace/api-client-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Users, Film, Ticket, DollarSign, Settings, Plus, Edit, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { data: profile, isLoading } = useGetMyProfile({
    query: { enabled: true, queryKey: getGetMyProfileQueryKey() }
  });

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!profile?.isAdmin) {
    setLocation("/");
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 pb-24">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 flex items-center gap-3">
        <Settings className="w-8 h-8 text-primary" />
        Admin Control Panel
      </h1>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="bg-card border border-border mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="shows">Shows</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard"><DashboardTab /></TabsContent>
        <TabsContent value="shows"><ShowsTab /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="purchases"><PurchasesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function DashboardTab() {
  const { data: stats } = useGetAdminDashboard({
    query: { enabled: true, queryKey: getGetAdminDashboardQueryKey() }
  });

  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} icon={<DollarSign />} />
        <StatCard title="Tickets Sold" value={stats.totalTickets} icon={<Ticket />} />
        <StatCard title="Total Shows" value={stats.totalShows} icon={<Film />} />
        <StatCard title="Total Users" value={stats.totalUsers} icon={<Users />} />
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Recent Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Show</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentPurchases.map(p => (
                  <tr key={p.id} className="border-b border-border">
                    <td className="px-6 py-4">{p.userEmail}</td>
                    <td className="px-6 py-4 font-medium">{p.showTitle}</td>
                    <td className="px-6 py-4 text-primary">${p.amountPaid.toFixed(2)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{format(new Date(p.purchasedAt), 'MMM d, yyyy HH:mm')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
        </div>
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function ShowsTab() {
  const queryClient = useQueryClient();
  const { data: shows } = useListShows({ category: "all" }, { query: { enabled: true, queryKey: getListShowsQueryKey({ category: "all" }) } });
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<any>(null);
  
  const defaultForm = {
    title: "", description: "", thumbnailUrl: "", videoUrl: "", price: 0, category: "now_showing" as const, 
    genre: "", duration: 120, startTime: new Date().toISOString().slice(0,16), isLive: false, isFeatured: false
  };
  const [formData, setFormData] = useState(defaultForm);

  const createMut = useCreateShow({ onSuccess: () => { setIsEditorOpen(false); queryClient.invalidateQueries({queryKey: getListShowsQueryKey()}); toast.success("Created"); }});
  const updateMut = useUpdateShow({ onSuccess: () => { setIsEditorOpen(false); queryClient.invalidateQueries({queryKey: getListShowsQueryKey()}); toast.success("Updated"); }});
  const deleteMut = useDeleteShow({ onSuccess: () => { queryClient.invalidateQueries({queryKey: getListShowsQueryKey()}); toast.success("Deleted"); }});

  const openEditor = (show?: any) => {
    if (show) {
      setEditingShow(show);
      setFormData({
        title: show.title, description: show.description, thumbnailUrl: show.thumbnailUrl || "", videoUrl: show.videoUrl || "",
        price: show.price, category: show.category, genre: show.genre || "", duration: show.duration || 120, 
        startTime: show.startTime ? new Date(show.startTime).toISOString().slice(0,16) : "",
        isLive: show.isLive, isFeatured: show.isFeatured
      });
    } else {
      setEditingShow(null);
      setFormData(defaultForm);
    }
    setIsEditorOpen(true);
  };

  const handleSave = () => {
    const payload = {
      ...formData,
      startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null
    };
    if (editingShow) updateMut.mutate({ id: editingShow.id, data: payload });
    else createMut.mutate({ data: payload });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => openEditor()}><Plus className="w-4 h-4 mr-2"/> Add Show</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shows?.map(show => (
          <Card key={show.id} className="bg-card border-border overflow-hidden">
            {show.thumbnailUrl && <img src={show.thumbnailUrl} className="w-full h-40 object-cover" />}
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg line-clamp-1">{show.title}</h3>
                <span className="text-primary font-bold">${show.price}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{show.description}</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditor(show)}><Edit className="w-4 h-4"/></Button>
                <Button variant="destructive" size="sm" onClick={() => confirm("Delete?") && deleteMut.mutate({id: show.id})}><Trash2 className="w-4 h-4"/></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader><DialogTitle>{editingShow ? "Edit Show" : "Add Show"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <label className="text-sm">Title</label>
              <Input value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm">Description</label>
              <Textarea value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Thumbnail URL</label>
              <Input value={formData.thumbnailUrl} onChange={e=>setFormData({...formData, thumbnailUrl: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Video URL</label>
              <Input value={formData.videoUrl} onChange={e=>setFormData({...formData, videoUrl: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Price ($)</label>
              <Input type="number" value={formData.price} onChange={e=>setFormData({...formData, price: Number(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Category</label>
              <Select value={formData.category} onValueChange={(v: any)=>setFormData({...formData, category: v})}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="now_showing">Now Showing</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Genre</label>
              <Input value={formData.genre} onChange={e=>setFormData({...formData, genre: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Duration (mins)</label>
              <Input type="number" value={formData.duration} onChange={e=>setFormData({...formData, duration: Number(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Start Time (Local)</label>
              <Input type="datetime-local" value={formData.startTime} onChange={e=>setFormData({...formData, startTime: e.target.value})} />
            </div>
            <div className="col-span-2 flex gap-6 mt-4 border border-border p-4 rounded-lg bg-muted/20">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={formData.isLive} onCheckedChange={(c)=>setFormData({...formData, isLive: !!c})} />
                <span>Is Live Event</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={formData.isFeatured} onCheckedChange={(c)=>setFormData({...formData, isFeatured: !!c})} />
                <span>Is Featured (Hero)</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UsersTab() {
  const { data: users } = useListUsers({ query: { enabled: true, queryKey: getListUsersQueryKey() } });
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
            <tr><th className="px-6 py-4">Email</th><th className="px-6 py-4">Name</th><th className="px-6 py-4">Tickets</th><th className="px-6 py-4">Joined</th></tr>
          </thead>
          <tbody>
            {users?.map(u => (
              <tr key={u.id} className="border-b border-border">
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">{u.displayName || '-'}</td>
                <td className="px-6 py-4 font-bold">{u.ticketCount}</td>
                <td className="px-6 py-4 text-muted-foreground">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function PurchasesTab() {
  const { data: purchases } = useListAllPurchases({ query: { enabled: true, queryKey: getListAllPurchasesQueryKey() } });
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
            <tr><th className="px-6 py-4">User</th><th className="px-6 py-4">Show</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Date</th></tr>
          </thead>
          <tbody>
            {purchases?.map(p => (
              <tr key={p.id} className="border-b border-border">
                <td className="px-6 py-4">{p.userEmail}</td>
                <td className="px-6 py-4 font-medium">{p.showTitle}</td>
                <td className="px-6 py-4 text-primary font-bold">${p.amountPaid.toFixed(2)}</td>
                <td className="px-6 py-4 text-muted-foreground">{format(new Date(p.purchasedAt), 'MMM d, yyyy HH:mm')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}