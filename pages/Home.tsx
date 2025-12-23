import React from 'react';
import { useProjects } from '../context/ProjectContext';
import ProjectCard from '../components/ProjectCard';
import { ArrowRight, CheckCircle2, Award, Clock, Users, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { projects, settings } = useProjects();
  const featuredProjects = projects.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src={settings.homePage?.heroImage || "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=1920"}
            alt="Modern Architecture"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="container relative z-10 px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight whitespace-pre-line">
            {settings.homePage?.heroTitle || "Building Dreams,\nCreating Legacies."}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            {settings.homePage?.heroSubtitle || settings.content.aboutUsShort}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/projects" className="bg-primary hover:bg-green-700 text-white px-8 py-3.5 rounded-full font-semibold transition-all transform hover:scale-105">
              Explore Our Projects
            </Link>
            <Link to="/contact" className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-3.5 rounded-full font-semibold transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-primary font-semibold tracking-wider uppercase text-sm">Our Portfolio</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">Featured Projects</h2>
            </div>
            <Link to="/projects" className="hidden md:flex items-center gap-2 text-primary font-semibold hover:text-green-700">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          <div className="mt-8 md:hidden text-center">
            <Link to="/projects" className="inline-flex items-center gap-2 text-primary font-semibold">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-primary font-semibold tracking-wider uppercase text-sm">Why Choose Us</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">Excellence in Every Detail</h2>
            <p className="text-gray-600">
              With over 20 years of experience, we pride ourselves on delivering exceptional quality and value to our clients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: CheckCircle2, title: 'Quality Build', desc: 'We stress on using the best raw materials like BSRM steel and Lafarge Holcim cement to ensure your safety.' },
              { icon: Clock, title: 'On Time Handover', desc: 'We value your time. Our rigorous project management ensures we deliver your dream home exactly when promised.' },
              { icon: Edit2, title: 'Customisable', desc: 'Your home, your choice. We offer flexible internal layout options to perfectly suit your family requirements.' },
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors group text-center">
                <div className="inline-block p-4 bg-white rounded-full shadow-sm mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <item.icon className="w-8 h-8 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Your Dream Property?</h2>
          <p className="text-green-100 mb-8 text-lg max-w-2xl mx-auto">
            Schedule a consultation with our experts today and take the first step towards your new home.
          </p>
          <Link to="/contact" className="inline-block bg-white text-primary hover:bg-gray-100 px-8 py-3.5 rounded-full font-bold shadow-lg transition-transform hover:-translate-y-1">
            Get in Touch
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;