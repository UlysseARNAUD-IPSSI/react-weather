import './index.css';

function Result({city}) {
    if (!city) return (
        <section className="App-section-result">
            Nothing to show :(
        </section>
    )

    let {name, sys, dt, weather, wind, main} = city
    const {country} = sys
    const {humidity, temp} = main

    const date = new Date(dt * 1000)

    const dateAsString = `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`

    const firstWeather = weather[0]
    let skyDescription = null
    if (!!firstWeather) {
        skyDescription = weather.description
    }

    return (
        <section className="App-section-result">

            <article>
                <header className="App-section-result-header">{name}, {country}</header>
                <section>
                    <article className="App-section-result-temperature">
                        {temp}°F
                    </article>
                    <article className="App-section-result-stats">
                        <p className="App-section-result-stats-sky">
                            {dateAsString}<br/>{skyDescription}
                        </p>
                        <p className="App-section-result-stats-wind">
                            Vent: {wind.speed} mph (Angle {wind.deg}°)
                        </p>
                        <p className="App-section-result-stats-humidity">
                            Humidité: {humidity}%
                        </p>
                    </article>
                    <article className="App-section-result-next_days"></article>
                </section>
            </article>

        </section>
    )
}

export default Result
