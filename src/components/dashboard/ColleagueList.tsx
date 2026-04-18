import { useEffect, useState } from "react";
import { discoveryService } from "@/services/discoveryService";
import { User } from "@/types/discovery";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, MessageSquare, UserCircle, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export const ColleagueList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [colleagues, setColleagues] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchColleagues = async () => {
        setIsLoading(true);
        try {
            // For colleagues, we filter connections that have professional roles
            const result = await discoveryService.getConnections();
            const profs = result.filter(u =>
                (u.roles?.includes('doctor') || u.roles?.includes('nurse') || u.roles?.includes('specialist') || u.roles?.includes('center'))
            );
            setColleagues(profs);
        } catch (error) {
            console.error("Failed to fetch colleagues:", error);
            toast.error("Could not load colleagues list");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchColleagues();
    }, []);

    const filteredColleagues = colleagues.filter(c =>
        c.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Colleagues</CardTitle>
                    <CardDescription>Verified healthcare professionals in your network</CardDescription>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate('/discovery?type=doctor')}>
                    <Search className="mr-2 h-4 w-4" />
                    Find Colleagues
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex items-center mb-6">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by name or specialty..."
                            className="pl-10 rounded-xl bg-gray-50 border-gray-100"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead>Physician / Colleague</TableHead>
                                <TableHead>Specialization</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-gray-400">
                                        Loading colleagues...
                                    </TableCell>
                                </TableRow>
                            ) : filteredColleagues.length > 0 ? (
                                filteredColleagues.map((colleague: User) => (
                                    <TableRow key={colleague.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {colleague.avatar ? (
                                                    <img src={colleague.avatar} alt="" className="h-8 w-8 rounded-full" />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                                                        {colleague.displayName?.charAt(0)}
                                                    </div>
                                                )}
                                                <span className="font-medium text-gray-900">{colleague.displayName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{colleague.specialty || '--'}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {colleague.roles?.map(role => (
                                                    <Badge key={role} variant="secondary" className="text-[10px] uppercase">{role}</Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-xs">{colleague.email || colleague.phone || 'In-App Chat'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-indigo-600"
                                                    onClick={() => navigate(`/chat?userId=${colleague.id}`)}
                                                    title="Send Message"
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-blue-600"
                                                    onClick={() => navigate(`/profile/${colleague.publicId || colleague.id}`)}
                                                    title="View Profile"
                                                >
                                                    <UserCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-gray-400">
                                        No colleagues in your network yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};
