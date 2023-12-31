import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Map, {Marker, Popup} from 'react-map-gl';
import pin from '../assets/pin-svgrepo-com.svg';
import noImageIcon from '../assets/no-image-icon.jpg';
import AdventureAutocomplete from "./AdventureAutocomplete";
import StateAutocomplete from "./StateAutocomplete";
import NationalParkAutocomplete from "./NationalParkAutocomplete";

export default function HomepageMap({coordinates, parks}) {
    const [viewport, setViewport] = useState({
        latitude: 39.8283,
        longitude: -98.5795,
        zoom: 2.5,
    });
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [selectedPark, setSelectedPark] = useState(null);
    const [selectedActivities, setSelectedActivities] = useState([]);
    const [filteredParkCoordinates, setFilteredParkCoordinates] = useState(coordinates.parkCoordinates);
    const [filteredParks, setFilteredParks] = useState(parks);
    const [selectedState, setSelectedState] = useState([]);
    const [parksByState, setParksByState] = useState([]);
    const [parksByActivities, setParksByActivities] = useState([]);
    const [selectedNationalParks, setSelectedNationalParks] = useState([]);
    const [parksBySelectedPark, setParksBySelectedPark] = useState([]);
    const [markerImageLoaded, setMarkerImageLoaded] = useState(false);

    const allParkCoordinates = coordinates.parkCoordinates;
    const allParks = parks;
    const userLocation = coordinates.userLocation;

    const handleActivitySelection = (activities) => {
        setSelectedActivities(activities);
    }

    const handleStateSelection = (states) => {
        setSelectedState(states);
    }

    const handleNationalParkSelection = (selectedParks) => {
        setSelectedNationalParks(selectedParks);
    }

    const handleMarkerImageLoad = () => {
        setMarkerImageLoaded(true);
    }

    const handleImageError = (image) => {
        const markerImageElement = document.getElementById('loading');
        markerImageElement.src = image
    }

    const filterCoords = (parksToFilter, coordsToFilter) => {
        const filteredCoords = [];
        parksToFilter.forEach(park => {
            coordsToFilter.forEach(coord => {
                if (park.fullName === coord.parkName) {
                    filteredCoords.push(coord);
                }
            })
        })
        return filteredCoords;
    }


    const filterParks = (arr, filterArr) => {
        const filteredItems = [];
        arr.forEach((item) => {
            filterArr.forEach((filter) => {
                if (item.fullName === filter.fullName) {
                    filteredItems.push(item);
                }
            })
        })
        return filteredItems;
    }

    useEffect(() => {
        //sets image of marker Popup component on user selection
        if (selectedMarker) {

            const selectedPark = allParks.filter((park) => park.fullName === selectedMarker.parkName);
            setSelectedPark(selectedPark);
            setViewport({
                            latitude: Number(selectedMarker.latitude), 
                            longitude: Number(selectedMarker.longitude),
                            zoom: 3.5
                        });

        }
    }, [selectedMarker])

    useEffect(() => {
        //filters out parks that do not have every user selected activity in their respective activity array.

        if (selectedActivities.length > 0) {

            const filteredParksByActivities = allParks.filter((park) => {

                const parkActivityNames = park.activities.map((activity) => activity.name);
                return selectedActivities.every((activity) => parkActivityNames.includes(activity.activityName));

            });

            setParksByActivities(filteredParksByActivities);

        } else {

            setParksByActivities([]);

        }
    }, [selectedActivities]);

    useEffect(() => {
        //filters parks that don't include user selected state in the parks 'states' array
        if (selectedState.length > 0) {

            const filteredParksByState = [];
            allParks.forEach(park => {
                selectedState.forEach(state => {
                    if (park.states.includes(state) && !filteredParksByState.includes(park)) {
                        filteredParksByState.push(park);
                    }
                })
            })

            setParksByState(filteredParksByState);

        } else {

            setParksByState([]);

        }
    }, [selectedState]);

    useEffect(() => {
        //filters parks which do not match the string park.fullName
        if (selectedNationalParks.length > 0) {

            const parkByName = filterParks(allParks, selectedNationalParks);
            setParksBySelectedPark(parkByName);

        } else {

            setParksBySelectedPark(allParks);

        }
    }, [selectedNationalParks])

    useEffect(() => {
        if (parksByActivities.length > 0 && parksByState.length > 0 ) {

            const filteredParksByActivitiesAndState = filterParks(parksByActivities, parksByState);

            if (selectedNationalParks.length === 0) {

                const filteredParksCoordinates = filterCoords(filteredParksByActivitiesAndState, allParkCoordinates);
                setFilteredParks(filteredParksByActivitiesAndState);
                setFilteredParkCoordinates(filteredParksCoordinates);

            } else {

                const selectedParksWithFilters = filterParks(filteredParksByActivitiesAndState, parksBySelectedPark);
                const selectedParkWithFiltersCoords = filterCoords(selectedParksWithFilters, allParkCoordinates);
                setFilteredParkCoordinates(selectedParkWithFiltersCoords);
                setFilteredParks(selectedParksWithFilters);

            }
        } else if (parksByState.length > 0) {
            if (selectedNationalParks.length === 0) {

                const filteredCoordsByState = filterCoords(parksByState, allParkCoordinates);
                setFilteredParkCoordinates(filteredCoordsByState);
                setFilteredParks(parksByState);

            } else {

                const selectedParksWithStateFilter = filterParks(parksByState, parksBySelectedPark);
                const selectedParkWithStateFilterCoords = filterCoords(selectedParksWithStateFilter, allParkCoordinates);
                setFilteredParkCoordinates(selectedParkWithStateFilterCoords);
                setFilteredParks(selectedParksWithStateFilter);

            }

        } else if (parksByActivities.length > 0) {
            if (selectedNationalParks.length === 0) {

                const filteredCoordsByActivities = filterCoords(parksByActivities, allParkCoordinates);
                setFilteredParkCoordinates(filteredCoordsByActivities);
                setFilteredParks(parksByActivities); 

            } else {

                const selectedParksWithActivityFilter = filterParks(parksByActivities, parksBySelectedPark);
                const selectedParksWithActivityFilterCoords = filterCoords(selectedParksWithActivityFilter, allParkCoordinates);
                setFilteredParkCoordinates(selectedParksWithActivityFilterCoords);
                setFilteredParks(selectedParksWithActivityFilter);

            }
        } else {
            if (selectedNationalParks.length === 0) {

                setFilteredParkCoordinates(allParkCoordinates);
                setFilteredParks(parksBySelectedPark);

            } else {

                const selectedParksNoFilters = filterCoords(parksBySelectedPark, filteredParkCoordinates);
                setFilteredParks(parksBySelectedPark);
                setFilteredParkCoordinates(selectedParksNoFilters);

            }
        }
    }, [parksByState, parksByActivities, parksBySelectedPark]);

    return (
        <div id='map-and-list'>
            <div id='filter-and-list-wrapper'>
                <div id='filters-wrapper'>
                    <StateAutocomplete sendStateToMap={handleStateSelection}/>
                    <AdventureAutocomplete sendActivityToMap={handleActivitySelection} />
                    <NationalParkAutocomplete parks={filteredParks} sendNationalParksToMap={handleNationalParkSelection}/>
                </div>
                <div id='list'>
                    {
                        filteredParks.map((park, index) => {
                            let image;

                            park.images.length > 0 ?
                            image = park.images[0].url
                            : 
                            image = noImageIcon;
/*                          
                            **currently configuring aws s3 to decrease image load times**
                            const newImage = image.replace('www.nps.gov/common/uploads/structured_data/', 'wanderamerica.s3.amazonaws.com/parkImages/images/');
                            console.log(image, newImage);
*/
                            

                            return (
                                <Link 
                                    key={park.fullName} 
                                    className='park-and-info' 
                                    to='/NatParkPage' 
                                    state={{selectedPark: [park], userLocation: userLocation, parkImage: image}}
                                >
                                    <img 
                                        className={'park-image-loaded'}
                                        src={image}
                                        alt={park.images.length > 0 ? park.images[0].altText : 'No Image Available'}
                                        onError={(e) => {
                                            e.target.onError = null;
                                            e.target.src = noImageIcon;
                                        }}
                                    />
                                    <h2 className='park-name'>{park.fullName}</h2>
                                </Link>
                            );
                        })
                    }
                </div>
            </div>
            <Map
                initialViewState={viewport}
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                style={{width: '100%', height: '600px',}}
                mapStyle={'mapbox://styles/michaeljriordan/clmf3bjbc015j01r63fxg8ezj'}
            >
                {
                    filteredParkCoordinates.map((coords) => {
                        return (
                            <Marker
                                key={coords.parkName}
                                latitude={Number(coords.latitude)}
                                longitude={Number(coords.longitude)}
                                >
                                <div 
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => setSelectedMarker(coords)}
                                    >
                                    <img
                                        src={pin}
                                        style={{
                                            width: '25px',
                                            height: '25px',
                                            cursor: 'pointer',
                                        }}
                                        
                                    />
                                </div>
                            </Marker>
                        );
                    })
                }
                { selectedMarker && (
                        <Popup
                            latitude={Number(selectedMarker.latitude)}
                            longitude={Number(selectedMarker.longitude)}
                            onClose={() => {
                                setMarkerImageLoaded(false) 
                                setSelectedMarker(null)
                            }}
                            closeOnClick={false}
                            key={selectedMarker.parkName}
                        >
                            <div id='popup-div'>
                                <div id={markerImageLoaded ? '' : 'image-container'}>
                                    <img 
                                        id={markerImageLoaded ? `popup-park-image` : 'loading'} 
                                        src={selectedMarker.parkImage}
                                        style={markerImageLoaded ? {visibility: 'visible'} : {visibility: 'hidden'}} 
                                        onLoad={handleMarkerImageLoad}
                                        onError={() => handleImageError(selectedMarker.parkImage)}
                                    />
                                </div>
                                <h3 id='popup-park-name'>{selectedMarker.parkName}</h3>
                                {markerImageLoaded ?  
                                    <Link 
                                        to='/NatParkPage' 
                                        state={{selectedPark: selectedPark, userLocation: userLocation, parkImage: selectedMarker.parkImage}}
                                        id='popup-link'
                                    >
                                        Explore
                                    </Link> :
                                <p id='popup-link'>Loading...</p>}
                            </div>
                        </Popup>
                )}
            </Map>
        </div>
    );
}