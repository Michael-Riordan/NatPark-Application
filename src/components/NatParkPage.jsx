import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NationalParkPageMap from "./NationalParkPageMap";

export default function NatParkPage() {
    const [geoJsonCoordinates, setGeoJsonCoordinates] = useState([]);
    const [images, setImages] = useState([]);
    const [groupedActivities, setGroupedActivities] = useState(null);
    const [activityNames, setActivityNames] = useState([]);
    const [visitorCenters, setVisitorCenters] = useState([]);
    const location = useLocation();
    const serverEndPoint = import.meta.env.VITE_HEROKU_ENDPOINT;
    const park = location.state.selectedPark;
    const userLocation = location.state.userLocation;
    
    useEffect(() => {

        const parkCode = park[0].parkCode;
        const parkCodeQuery = `?parkCode=${parkCode}`
        const fetchGeoJSONCoordinates = async () => {
            const response = await fetch(`${serverEndPoint}/api/NationalParkGeoJson${parkCodeQuery}`);
            const jsonResponse = await response.json();
            setGeoJsonCoordinates(jsonResponse);
        }

        if (park != null) {
            fetchGeoJSONCoordinates();
        }
    }, [park]);

    useEffect(() => {
        const urls = [];
        const parkImages = park[0].images;
        parkImages.forEach(image => {
            urls.push(image.url);
        });

        setImages(urls);

    }, [park]);

    useEffect(() => {
        const parkCode = park[0].parkCode;
        const parkCodeQuery = `?parkCode=${parkCode}`;
        let activitiesObject = {};

        const fetchThingsToDo = async () => {
            const response = await fetch(`${serverEndPoint}/api/NatParkThingsToDo${parkCodeQuery}`);
            const jsonResponse = await response.json();
            jsonResponse.data.forEach(activity => {
                const activityType = activity.activities[0].name;
                const activityTitle = activity.title;
                const activityDescription = activity.shortDescription;
                const activityImage = activity.images[0].url;
                const activityLngLat = {lat: activity.latitude, lng: activity.longitude}

                if (!activitiesObject[activityType]) {
                    activitiesObject[activityType] = [];
                }

                activitiesObject[activityType].push({name: activityTitle, description: activityDescription, image: activityImage, coords: activityLngLat, activityObj: activity});
            })

            setGroupedActivities(activitiesObject);
            setActivityNames(Object.keys(activitiesObject));
        }
        
        fetchThingsToDo();
    }, [park]);

    useEffect(() => {
        const parkCode = park[0].parkCode;
        const parkCodeQuery =  `?parkCode=${parkCode}`;
        const fetchVisitorCenters = async () => {
            const response = await fetch(`${serverEndPoint}/api/visitorCenters${parkCodeQuery}`);
            const jsonResponse = await response.json();
            setVisitorCenters(jsonResponse.data);
        }

        fetchVisitorCenters();

    }, [park]);

    return (
        <>
            {
            park == null? '' : 
            <section id='rec-area-page-body'>
                <section id='rec-area-map'>
                        <NationalParkPageMap
                            park={park} 
                            latitude={park[0].latitude}
                            longitude={park[0].longitude}
                            geojson={geoJsonCoordinates}
                            type={'nationalPark'}
                            userLocation={userLocation}
                            parkImage={images[0]}
                            parkName={park[0].fullName}
                            id='national-park-page-map'
                            visitorCenters={visitorCenters}
                        />
                </section> 
                <section id='park-information'>
                    <section className='park-page-name-and-description-wrapper'>
                        <h1 className='park-page-name'>{park[0].fullName}</h1>  
                        <p className='park-description'>{park[0].description}</p>
                    </section>
                    <section className='park-activities-section'>
                        <h2 id='activities-header'>Activities in {park[0].fullName}</h2>
                        <ul id='activities-wrapper'>
                            {
                                groupedActivities ?
                                activityNames.map((name) => {
                                    return (
                                        <div id='activity-name-and-list' name={name} key={name}>
                                            <h2 id='activity'>{name}</h2>
                                            <div className='activity-list'>
                                                {groupedActivities[name].map(activity => {
                                                    return (
                                                        <>
                                                            <Link 
                                                                key={activity.name} 
                                                                id='activity-wrapper' 
                                                                to='/SelectedActivity'
                                                                state={
                                                                    {
                                                                        activityName: activity.name, 
                                                                        latitude: activity.coords.lat, 
                                                                        longitude: activity.coords.lng, 
                                                                        image: activity.image,
                                                                        userLocation: userLocation,
                                                                        parkAddress: park[0].addresses[0],
                                                                        parkLatLng: {lat: park[0].latitude, lng: park[0].longitude},
                                                                        activityObj: activity.activityObj,
                                                                    }
                                                                }
                                                            >
                                                                <h1 id='activity-name'>
                                                                    {activity.name}
                                                                </h1>
                                                                <img 
                                                                    className='activity-image' 
                                                                    src={activity.image} 
                                                                />
                                                                <p id='activity-description'>
                                                                    {activity.description}
                                                                </p>
                                                            </Link>
                                                        </>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })
                                : ''
                            }
                        </ul>
                    </section>
                </section>
            </section>
            }
        </>
    );
}