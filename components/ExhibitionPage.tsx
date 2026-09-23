'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calendar, MapPin, Users, Building, Globe, ExternalLink, Phone, Mail,
  Clock, Award, Star, TrendingUp, FileText, MessageSquare, Share2,
  CheckCircle, AlertCircle, Info, Plane, Car, Train, Wifi,
  Shield, Leaf, Heart, Target, Trophy, Bookmark, DollarSign, ArrowLeft
} from 'lucide-react';
import { Exhibition } from '@/lib/data/exhibitions';
import { exhibitionBuilders, BuilderMatchingService } from '@/lib/data/exhibitionBuilders';
import Link from 'next/link';
import { getCityPageUrl } from '@/lib/utils/slugUtils';

interface ExhibitionPageProps {
  exhibitionSlug: string;
  initialExhibition?: Exhibition;
}

export default function ExhibitionPage({ exhibitionSlug, initialExhibition }: ExhibitionPageProps) {
  // Use provided exhibition data
  const exhibition = initialExhibition;

  // Consolidate exhibition check
  if (!exhibition) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Exhibition Not Found</h1>
            <p className="text-gray-600 mb-8">The exhibition you're looking for doesn't exist or has been removed from our system.</p>
            <Link href="/trade-shows" className="block w-full">
              <Button className="w-full bg-primary-blue hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Trade Shows
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric'
    };

    if (startDate.getFullYear() === endDate.getFullYear()) {
      return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}, ${startDate.getFullYear()}`;
    } else {
      return `${startDate.toLocaleDateString('en-US', { ...options, year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return 'bg-green-500';
      case 'Live': return 'bg-red-500';
      case 'Completed': return 'bg-gray-500';
      case 'Cancelled': return 'bg-red-600';
      case 'Postponed': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const handleFindBoothBuilders = () => {
    window.open(getCityPageUrl(exhibition.country, exhibition.city), '_blank');
  };

  const handleAddToCalendar = () => {
    const startDate = new Date(exhibition.startDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(exhibition.endDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const title = encodeURIComponent(exhibition.name);
    const location = encodeURIComponent(`${exhibition.venue.name}, ${exhibition.city}, ${exhibition.country}`);
    const details = encodeURIComponent(exhibition.shortDescription);

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&location=${location}&details=${details}`;
    window.open(googleCalendarUrl, '_blank');
  };

  const handleShareExhibition = () => {
    if (navigator.share) {
      navigator.share({
        title: exhibition.name,
        text: exhibition.shortDescription,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Exhibition link copied to clipboard!');
    }
  };

  // Get recommended vendors based on exhibition location
  const recommendedVendors = exhibition ?
    BuilderMatchingService.getBuildersByLocation(exhibition.city, exhibition.country).slice(0, 5) : [];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  {exhibition.industry.name}
                </Badge>
                <Badge className={`${getStatusColor(exhibition.status)} text-white`}>
                  {exhibition.status}
                </Badge>
                {exhibition.featured && (
                  <Badge className="bg-yellow-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {exhibition.trending && (
                  <Badge className="bg-red-500 text-white">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl lg:text-5xl font-bold mb-4 break-words" data-macaly="exhibition-title">
                {exhibition.name}
              </h1>

              <p className="text-xl opacity-90 mb-6" data-macaly="exhibition-description">
                {exhibition.shortDescription}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-3">
                  <Calendar className="h-5 w-5" />
                  <div>
                    <p className="text-sm opacity-80">Duration</p>
                    <p className="font-semibold">{formatDateRange(exhibition.startDate, exhibition.endDate)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-3">
                  <MapPin className="h-5 w-5" />
                  <div>
                    <p className="text-sm opacity-80">Location</p>
                    <p className="font-semibold">{exhibition.city}, {exhibition.country}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-3">
                  <Users className="h-5 w-5" />
                  <div>
                    <p className="text-sm opacity-80">Expected Attendees</p>
                    <p className="font-semibold">{exhibition.expectedAttendees.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-white">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-white text-black hover:bg-gray-100"
                      onClick={handleFindBoothBuilders}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Find Booth Builders
                    </Button>
                    <Button
                      className="w-full bg-white/20 text-white border-white/30 hover:bg-white/30"
                      onClick={handleAddToCalendar}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Add to Calendar
                    </Button>
                    <Button
                      className="w-full bg-white/20 text-white border-white/30 hover:bg-white/30"
                      onClick={handleShareExhibition}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Exhibition
                    </Button>
                  </div>

                  <Separator className="my-4 bg-white/20" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="opacity-80">Organizer Rating</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{exhibition.organizer.rating}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-80">Exhibitors</span>
                      <span className="font-medium">{exhibition.expectedExhibitors.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-80">Venue Space</span>
                      <span className="font-medium">{exhibition.venue.totalSpace.toLocaleString()} sqm</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* About Exhibition */}
            <Card>
              <CardHeader>
                <CardTitle><h2 className="text-2xl font-bold">About This Exhibition</h2></CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-6 break-words" data-macaly="exhibition-full-description">
                  {exhibition.description}
                </p>

                <h3 className="font-semibold text-gray-900 mb-3 text-xl">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {exhibition.keyFeatures.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {exhibition.targetAudience && exhibition.targetAudience.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3 text-xl">Target Audience</h3>
                    <div className="flex flex-wrap gap-2">
                      {exhibition.targetAudience.map((audience: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          {audience}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Venue Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <h2 className="text-2xl font-bold">Venue Information</h2>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl break-words">{exhibition.venue.name}</h3>
                    <p className="text-gray-600 break-words">{exhibition.venue.address}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{exhibition.venue.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Plane className="h-4 w-4" />
                        <span>{exhibition.venue.distanceFromAirport} from {exhibition.venue.nearestAirport}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 border-b pb-1 text-lg">Venue Facilities</h3>
                      <div className="space-y-1">
                        {exhibition.venue.facilities.map((facility: string, index: number) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-gray-700">{facility}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 border-b pb-1 text-lg">Transportation</h3>
                      <div className="space-y-1">
                        {exhibition.venue.publicTransport.map((transport: string, index: number) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-gray-700">{transport}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Events */}
            {exhibition.specialEvents && exhibition.specialEvents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Special Events</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {exhibition.specialEvents.map((event: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{event.name}</h4>
                          <Badge variant="outline">{event.type}</Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{event.time} ({event.duration})</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{event.capacity} capacity</span>
                          </div>
                          {event.fee > 0 && (
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{event.currency} {event.fee}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sustainability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Leaf className="h-5 w-5" />
                  <h2 className="text-2xl font-bold">Sustainability</h2>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {exhibition.sustainability.carbonNeutral ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">Carbon Neutral</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {exhibition.sustainability.wasteReduction ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">Waste Reduction</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {exhibition.sustainability.digitalFirst ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">Digital First</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {exhibition.sustainability.sustainableCatering ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">Sustainable Catering</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {exhibition.sustainability.publicTransportIncentives ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">Public Transport Incentives</span>
                    </div>
                  </div>
                </div>

                {exhibition.sustainability.environmentalGoals && exhibition.sustainability.environmentalGoals.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-900 mb-2 border-b pb-1 text-lg">Environmental Goals</h3>
                    <div className="flex flex-wrap gap-2">
                      {exhibition.sustainability.environmentalGoals.map((goal: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs pointer-events-none hover:bg-secondary">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommended Vendors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <h2 className="text-2xl font-bold">Recommended Vendors</h2>
                </CardTitle>
                <CardDescription>
                  Experienced booth builders and event planners for this exhibition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Show actual builders from the location */}
                  {recommendedVendors.length > 0 ? (
                    recommendedVendors.map((builder) => (
                      <div key={builder.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all gap-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex-shrink-0 flex items-center justify-center">
                            <Building className="h-6 w-6 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-gray-900 break-words">{builder.companyName}</h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
                              <span>Exhibition Stand Builder</span>
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span>{builder.rating}</span>
                              </div>
                              <span>{builder.projectsCompleted} projects</span>
                              {builder.verified && (
                                <Badge variant="outline" className="text-[10px] h-4">
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 sm:shrink-0">
                          <Link href={`/builders/${builder.slug}`} className="flex-1 sm:flex-none">
                            <Button size="sm" variant="outline" className="w-full text-gray-900">
                              View Profile
                            </Button>
                          </Link>
                          <Button size="sm" className="flex-1 sm:flex-none bg-pink-600 text-white">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No local vendors found yet.</p>
                    </div>
                  )}

                  {/* Browse All Vendors Button - Filtered to exhibition location */}
                  <div className="pt-4 border-t">
                    <Link href={`/builders?country=${encodeURIComponent(exhibition.country)}&city=${encodeURIComponent(exhibition.city)}`} className="w-full">
                      <Button variant="outline" className="w-full text-gray-900 hover:bg-pink-50 hover:border-pink-300">
                        Browse All Vendors in {exhibition.city}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">

            {/* Pricing Information - Commented out as requested */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Booth Pricing</CardTitle>
                <CardDescription>Estimated costs for exhibition booths</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Standard Booth</span>
                    <Badge variant="outline">Per {exhibition.pricing.standardBooth.unit}</Badge>
                  </div>
                  <div className="text-2xl font-bold text-pink-600">
                    {exhibition.pricing.standardBooth.currency} {exhibition.pricing.standardBooth.min} - {exhibition.pricing.standardBooth.max}
                  </div>
                </div>

                <div className="p-4 bg-rose-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Premium Booth</span>
                    <Badge variant="outline">Per {exhibition.pricing.premiumBooth.unit}</Badge>
                  </div>
                  <div className="text-2xl font-bold text-rose-600">
                    {exhibition.pricing.premiumBooth.currency} {exhibition.pricing.premiumBooth.min} - {exhibition.pricing.premiumBooth.max}
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Corner Booth</span>
                    <Badge variant="outline">Per {exhibition.pricing.cornerBooth.unit}</Badge>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {exhibition.pricing.cornerBooth.currency} {exhibition.pricing.cornerBooth.min} - {exhibition.pricing.cornerBooth.max}
                  </div>
                </div>

                {exhibition.pricing.earlyBirdDiscount > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        Early Bird Discount: {exhibition.pricing.earlyBirdDiscount}% off
                      </span>
                    </div>
                  </div>
                )}

                <Button className="w-full bg-pink-600 text-white">
                  Get Custom Quote
                </Button>
              </CardContent>
            </Card> */}

            {/* Organizer Information */}
            <Card>
              <CardHeader>
                <CardTitle><h2 className="text-2xl font-bold">Organizer Informations</h2></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl">{exhibition.organizer.name}</h3>
                    <p className="text-sm text-gray-600">{exhibition.organizer.headquarters}</p>
                    <p className="text-sm text-gray-600">Since {exhibition.organizer.establishedYear}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{exhibition.organizer.rating} organizer rating</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full text-gray-900"
                    onClick={() => window.open(exhibition.organizer.website, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Organizer Website
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Registration Information */}
            <Card>
              <CardHeader>
                <CardTitle><h2 className="text-2xl font-bold">Registration</h2></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Visitor Registration</h3>
                    <p className="text-sm text-gray-600">
                      {exhibition.registrationInfo.visitorRegistration.fee > 0
                        ? `${exhibition.registrationInfo.visitorRegistration.currency} ${exhibition.registrationInfo.visitorRegistration.fee}`
                        : 'Free'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Opens: {formatDate(exhibition.registrationInfo.visitorRegistration.opens)}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Exhibitor Registration</h3>
                    <p className="text-sm text-gray-600">
                      {exhibition.registrationInfo.exhibitorRegistration.currency} {exhibition.registrationInfo.exhibitorRegistration.fee}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Closes: {formatDate(exhibition.registrationInfo.exhibitorRegistration.closes)}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full text-gray-900"
                    onClick={() => window.open(exhibition.website, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Register Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Important Notice */}
            <Card className="border-pink-200 bg-pink-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-pink-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h2 className="font-bold text-pink-900 mb-1 text-xl">Contact Policy</h2>
                    <p className="text-sm text-pink-800">
                      All vendor contact goes through our secure platform. No direct contact information is shared publicly for your privacy and security.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
