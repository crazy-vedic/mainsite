import React from 'react'

export default function Portfolio() {
    const siteDetails = [
        {
            name: 'Ecommerce',
            website: 'https://kay-react-ecommerce.netlify.app',
            imgUrl: 'https://res.cloudinary.com/lollykrown/image/upload/v1599647132/Portfolios/ecommerce.png'
        },
        {
            name: 'Tourist App',
            website: 'https://naija-tourist.herokuapp.com',
            imgUrl: 'https://res.cloudinary.com/lollykrown/image/upload/v1600288517/Portfolios/tourism.png'
        },
        {
            name: 'Triangle',
            website: 'https://oluwakayode.netlify.app',
            imgUrl: 'https://res.cloudinary.com/lollykrown/image/upload/v1598612374/Portfolios/triangle2.png'
        },
        {
            name: 'Black Portfolio',
            website: 'https://github.com/lollykrown/Templates/tree/master/Portfolio%20Templates',
            imgUrl: 'https://res.cloudinary.com/lollykrown/image/upload/v1597944493/Portfolios/portfolio-black1.png'
        },
        {
            name: 'Blue Portfolio',
            website: 'https://lollykrown.xyz',
            imgUrl: 'https://res.cloudinary.com/lollykrown/image/upload/v1597944476/Portfolios/blue.png'
        },
        {
            name: 'Position',
            website: 'https://github.com/lollykrown/Templates/tree/master/Portfolio%20Templates',
            imgUrl: 'https://res.cloudinary.com/lollykrown/image/upload/v1597946060/Portfolios/position.png'
        },
        {
            name: 'Triangle 2',
            website: 'https://github.com/lollykrown/Templates/tree/master/Portfolio%20Templates',
            imgUrl: 'https://res.cloudinary.com/lollykrown/image/upload/v1598375046/Portfolios/tri.png'
        },
        {
            name: 'Border Portfolio',
            website: 'https://github.com/lollykrown/Templates/tree/master/Portfolio%20Templates',
            imgUrl: 'https://res.cloudinary.com/lollykrown/image/upload/v1597944500/Portfolios/portfolio-black2.png'
        },
        {
            name: 'Mini Netlify',
            website: 'https://min-netflix.netlify.app',
            imgUrl: 'https://res.cloudinary.com/lollykrown/image/upload/v1603489570/Portfolios/min-netflix.png'
        }
    ]
    return (
        <section >
            <h1 className="center">Portfolio</h1>
            <div className="row">
                {siteDetails.map((site, index) => {
                    return (
                        <a className="column" key={index} href={site.website}>
                            <div className="portfolio-container ">
                                <div className="bg"></div>
                                <img className="img" width="500" height="300"
                                    src={site.imgUrl} alt={site.name} />
                                <h3 className="portfolio-title">{site.name}</h3>
                            </div>
                        </a>
                    )
                })
                }
            </div>
        </section>
    )
}