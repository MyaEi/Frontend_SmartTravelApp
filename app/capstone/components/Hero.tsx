'use client';

import Image from 'next/image';

export default function Hero() {
  return (
    <>
      <header className="section-padding" style={{ backgroundColor: '#f9fafb' }}>
        <div className="container my-2">
          <div className="row align-items-center">
            <div className="col-md-6 text-center mb-3 mb-md-0">
              <Image
                src="/capstone/images/picture-travel-bag.jpg"
                alt="Travel illustration"
                width={640}
                height={480}
                className="img-fluid rounded shadow"
              />
            </div>
            <div className="col-md-6">
              <p className="welcome text-uppercase fw-bold" style={{ fontSize: '1.8rem', color: '#2c3e50', margin: 0 }}>
                Welcome to TravelGPT
              </p>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>We care about your trip</h3>
              <p style={{ lineHeight: 1.6, color: '#2c3e50', margin: 0 }}>
                ✨ Trusted by travelers, designed for you.<br/><br/>
                We believe every journey should be <strong>simple, smart, and stress-free</strong>.<br/>
                Our Intelligent Trip Planner helps you build itineraries, optimize budgets, and suggest the best experiences — all with your comfort in mind.<br/><br/>
                Sit back, relax, and let us make your trip unforgettable. 🌍✈️
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="section-padding" style={{ backgroundColor: '#ebebf1' }}>
        <div className="container">
          <h3 className="fade-in-scale-header text-uppercase text-center fw-bold" style={{ color: '#2c3e50', backgroundColor: 'rgb(235, 235, 241)' }}>
            Enjoy Services for your trip
          </h3>
          <div id="cardCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="2000">
            <div className="carousel-inner">
              <div className="carousel-item active">
                <div className="row">
                  <div className="col-12 col-md-3 mb-4">
                    <div className="card clickable-card servicecard_hover">
                      <img src="/capstone/images/trip-plan1.jpg" className="card-img-top" alt="Smart itineraries" />
                      <div className="card-body">
                        <h3 className="card-title">Smart itineraries</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-3 mb-4">
                    <div className="card clickable-card servicecard_hover">
                      <img src="/capstone/images/budget2.jpg" className="card-img-top" alt="Budget Optimization" />
                      <div className="card-body">
                        <h3 className="card-title">Budget Optimization</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-3 mb-4">
                    <div className="card clickable-card servicecard_hover">
                      <img src="/capstone/images/sentiment2.jpeg" className="card-img-top" alt="Sentiment Insights" />
                      <div className="card-body">
                        <h3 className="card-title">Sentiment Insights</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-3 mb-4">
                    <div className="card clickable-card servicecard_hover">
                      <img src="/capstone/images/language.jpeg" className="card-img-top" alt="Language Buddy" />
                      <div className="card-body">
                        <h3 className="card-title">Language Buddy</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card border border-0">
                      <img src="/capstone/images/alberta2.jpg" className="card-img-top" alt="Image 1" />
                      <h5 className="card-title text-center my-3 fw-semibold">Alberta</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <h2 className="text-center fw-bold my-3">What Our Clients Say</h2>
          <div className="row">
            <div className="col-md-4">
              <div className="card border border-0">
                <h5 className="card-title my-3 mx-3"><b>Sarah M., Toronto</b></h5>
                <p className="card-text mx-3 text-muted">"TravelGPT completely transformed the way I plan my trips! The smart itinerary feature saved me hours of research, and the suggestions were spot-on for my preferences. I felt like I had a personal travel assistant guiding me at every step. The budget optimization tips were especially helpful, letting me enjoy more experiences without overspending. I've already recommended it to all my friends"</p>
                <div className="star-rating mb-2 ms-3">
                  <i className="fa fa-star" aria-hidden="true"></i>
                  <i className="fa fa-star" aria-hidden="true"></i>
                  <i className="fa fa-star" aria-hidden="true"></i>
                  <i className="fa fa-star" aria-hidden="true"></i>
                  <i className="fa fa-star" aria-hidden="true"></i>
                </div>
                <p className="text-muted ms-3">5 out of 5 stars</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border border-0">
                <h5 className="card-title my-3 mx-3"><b>Daniel K., Vancouver</b></h5>
                <p className="card-text mx-3 text-muted">"I was impressed by how TravelGPT combined AI recommendations with real traveler insights. The suggested activities were unique and tailored to my interests. Planning a family vacation is usually stressful, but the platform made it smooth and enjoyable. I loved the sentiment insights feature—it really helped me pick destinations and experiences that matched our vibe perfectly."</p>
                <div className="star-rating mb-2 ms-3">
                  <i className="fa fa-star" aria-hidden="true"></i>
                  <i className="fa fa-star" aria-hidden="true"></i>
                  <i className="fa fa-star" aria-hidden="true"></i>
                  <i className="fa fa-star" aria-hidden="true"></i>
                  <i className="fa fa-star" aria-hidden="true"></i>
                </div>
                <p className="text-muted ms-3">5 out of 5 stars</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border border-0">
                <h5 className="card-title my-3 mx-3 fw-bolder">Priya S., Montreal</h5>
                <p className="card-text mx-3 text-muted">"TravelGPT is a game-changer for solo travelers like me. The app not only helped me design a complete itinerary but also offered language support tips and local recommendations that I would have missed otherwise. The interface is user-friendly, the suggestions are smart, and I felt confident exploring new places knowing everything was well-planned. Truly an indispensable tool for any traveler!"</p>
                <div className="star-rating mb-2 ms-3">
                  <i className="fa fa-star" aria-hidden="true"></i>
                  <i className="fa fa-star" aria-hidden="true"></i>
                  <i className="fa fa-star" aria-hidden="true"></i>
                  <i className="fa fa-star" aria-hidden="true"></i>
                  <i className="fa fa-star" aria-hidden="true"></i>
                </div>
                <p className="text-muted ms-3">5 out of 5 stars</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="container-fluid text-white my-3" style={{ backgroundColor: '#2c3e50' }}>
        <div className="container py-5 text-white">
          <div className="row">
            <h4 className="fw-bolder">About TravelGPT</h4>
            <p className="fs-6">Founded with the vision to simplify travel planning, TravelMate AI started as a small project in 2020 to help travelers create personalized itineraries effortlessly. Today, our platform serves thousands of travelers worldwide, offering smart AI-powered trip planning, budget optimization, and personalized recommendations. With a team dedicated to making every journey seamless and enjoyable, TravelMate AI continues to innovate, ensuring your trips are stress-free, memorable, and tailored just for you.</p>
          </div>
          <hr className="ms-lg-2" />
          <div className="row">
            <div className="col-12 col-md-6 col-lg-3">
              <span>GET IN TOUCH</span> <br />
              <hr className="w-25" />
              <span className="opacity-50">WHATSAPP</span><br />
              <span>(+1)523-428-4569</span><br /> <br />
              <span className="opacity-50">EMAIL</span><br />
              <span>enquiries@travelmateai.com</span><br /> <br />
              <span className="opacity-50">BUSINESS HOURS</span><br />
              <span>Open 24 hours, Mon to Sun</span><br />
              <p>
                <i className="fa-brands fa-square-facebook fa-3x"></i>
                <i className="fa-brands fa-square-github fa-3x mx-2"></i>
                <i className="fa-brands fa-linkedin fa-3x mx-2"></i>
                <i className="fa-brands fa-square-instagram fa-3x mx-2"></i>
              </p>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <span>OUR SERVICES</span> <br />
              <hr className="w-25" />
              <a href="" className="d-block text-decoration-none text-secondary footer_a_hover">Smart Itineraries</a>
              <a href="" className="d-block text-decoration-none text-secondary footer_a_hover">Budget Optimization</a>
              <a href="" className="d-block text-decoration-none text-secondary footer_a_hover">Sentiment Insights</a>
              <a href="" className="d-block text-decoration-none text-secondary footer_a_hover">Language Buddy</a>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <span>CORPORATE</span> <br />
              <hr className="w-25" />
              <a href="" className="d-block text-decoration-none text-secondary footer_a_hover">Trip Advisor</a><br />
              <span>CONTACT US</span><br />
              <hr className="w-25" />
              <a href="" className="d-block text-decoration-none text-secondary footer_a_hover">Book an appointment</a>
              <a href="" className="d-block text-decoration-none text-secondary footer_a_hover">Enquiries and Feedback</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}