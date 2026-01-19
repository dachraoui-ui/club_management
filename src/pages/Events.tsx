import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, MapPin, Users, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchInput } from '@/components/SearchInput';
import { StatusBadge } from '@/components/StatusBadge';
import { Progress } from '@/components/ui/progress';
import { useEvents } from '@/hooks/useEvents';

const ITEMS_PER_PAGE = 6;

const eventTypeColors: Record<string, string> = {
  Tournament: 'bg-accent/10 text-accent',
  Competition: 'bg-primary/10 text-primary',
  Workshop: 'bg-warning/10 text-warning',
  Social: 'bg-chart-4/10 text-chart-4',
};

export default function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);

  const filters = {
    type: typeFilter !== 'all' ? typeFilter : undefined,
  };

  const { data: eventsData, isLoading } = useEvents(filters);

  const events = useMemo(() => eventsData || [], [eventsData]);
  const filteredEvents = useMemo(() => events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }), [events, searchQuery]);

  const upcomingEvents = useMemo(() => filteredEvents.filter((e) => e.status === 'Upcoming' || e.status === 'Ongoing'), [filteredEvents]);
  const completedEvents = useMemo(() => filteredEvents.filter((e) => e.status === 'Completed'), [filteredEvents]);

  // Pagination for upcoming events
  const upcomingTotalPages = Math.ceil(upcomingEvents.length / ITEMS_PER_PAGE);
  const paginatedUpcoming = useMemo(() => {
    const startIndex = (upcomingPage - 1) * ITEMS_PER_PAGE;
    return upcomingEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [upcomingEvents, upcomingPage]);

  // Pagination for completed events
  const completedTotalPages = Math.ceil(completedEvents.length / ITEMS_PER_PAGE);
  const paginatedCompleted = useMemo(() => {
    const startIndex = (completedPage - 1) * ITEMS_PER_PAGE;
    return completedEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [completedEvents, completedPage]);

  // Reset pages when filters change - use useEffect instead
  // Note: Reset happens automatically when filteredEvents changes

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Events</h2>
          <p className="text-muted-foreground">Organize and manage club events</p>
        </div>
        <Link to="/events/new">
          <Button className="bg-accent hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <SearchInput
          value={searchQuery}
          onChange={(value) => {
            setSearchQuery(value);
            setUpcomingPage(1);
            setCompletedPage(1);
          }}
          placeholder="Search events..."
          className="flex-1 max-w-md"
        />
        <Select value={typeFilter} onValueChange={(value) => {
          setTypeFilter(value);
          setUpcomingPage(1);
          setCompletedPage(1);
        }}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Tournament">Tournament</SelectItem>
            <SelectItem value="Competition">Competition</SelectItem>
            <SelectItem value="Workshop">Workshop</SelectItem>
            <SelectItem value="Social">Social</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* No Events */}
      {events.length === 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first event</p>
            <Link to="/events/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events */}
      {events.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Upcoming Events ({upcomingEvents.length})</h3>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming events
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedUpcoming.map((event) => (
                <Link key={event.id} to={`/events/${event.id}`}>
                  <Card className="border-0 shadow-md card-hover h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${eventTypeColors[event.type] || 'bg-muted'}`}>
                          {event.type}
                        </span>
                        <StatusBadge status={event.status} />
                      </div>
                      <CardTitle className="text-lg mt-2">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{event.registered || 0}/{event.capacity}</span>
                          </div>
                          <span className="text-muted-foreground">
                            {Math.round(((event.registered || 0) / event.capacity) * 100)}% full
                          </span>
                        </div>
                        <Progress value={((event.registered || 0) / event.capacity) * 100} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              </div>

              {/* Upcoming Pagination */}
              {upcomingTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {((upcomingPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(upcomingPage * ITEMS_PER_PAGE, upcomingEvents.length)} of {upcomingEvents.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUpcomingPage(p => Math.max(1, p - 1))}
                      disabled={upcomingPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm">{upcomingPage} / {upcomingTotalPages}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUpcomingPage(p => Math.min(upcomingTotalPages, p + 1))}
                      disabled={upcomingPage === upcomingTotalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Completed Events */}
      {completedEvents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Past Events ({completedEvents.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCompleted.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card className="border-0 shadow-md opacity-75 hover:opacity-100 transition-opacity">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${eventTypeColors[event.type] || 'bg-muted'}`}>
                        {event.type}
                      </span>
                      <StatusBadge status={event.status} />
                    </div>
                    <CardTitle className="text-lg mt-2">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm mt-2">{event.registered || 0} participants</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Completed Pagination */}
          {completedTotalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((completedPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(completedPage * ITEMS_PER_PAGE, completedEvents.length)} of {completedEvents.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCompletedPage(p => Math.max(1, p - 1))}
                  disabled={completedPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">{completedPage} / {completedTotalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCompletedPage(p => Math.min(completedTotalPages, p + 1))}
                  disabled={completedPage === completedTotalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
