"use client";

import { useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
  ImageIcon,
  Layers,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { addPortfolioProject } from "@/features/portfolio/data/portfolio.mock";
import type {
  ConstructionAreaUnit,
  ConstructionProjectStatus,
  ConstructionProjectType,
  ConstructionSiteAreaUnit,
  PortfolioGalleryCategory,
  PortfolioGalleryItem,
  PortfolioMaterialItem,
  PortfolioProject,
} from "@/features/portfolio/types/portfolio.types";
import { formatProjectType } from "@/features/portfolio/utils/portfolio-project-format";
import styles from "./portfolio-add-project.module.css";

const CATEGORY_OPTIONS: { type: ConstructionProjectType; label: string }[] = [
  { type: "residential", label: "Residential" },
  { type: "commercial", label: "Commercial" },
  { type: "interior", label: "Interior Design" },
  { type: "renovation", label: "Renovation" },
  { type: "hospitality", label: "Hospitality" },
  { type: "retail", label: "Retail & Showroom" },
  { type: "institutional", label: "Institutional" },
  { type: "landscape", label: "Landscape" },
  { type: "multi_residential", label: "Multi-Residential" },
];

const STATUS_OPTIONS: { status: ConstructionProjectStatus; label: string }[] = [
  { status: "completed", label: "Completed" },
  { status: "ongoing", label: "Ongoing Construction" },
  { status: "design_development", label: "Design Development" },
  { status: "concept", label: "Concept & Scheme" },
  { status: "approval", label: "Statutory Approval" },
  { status: "tender", label: "Tender Stage" },
  { status: "draft", label: "Draft" },
];

const PRESET_COVERS = [
  { label: "Modern Courtyard", url: "/assets/hero-architecture-banner.webp" },
  { label: "Timber Villa", url: "/assets/projects/anitha_menon.png" },
  { label: "Contemporary Residence", url: "/assets/projects/greenfield-villa.png" },
  { label: "Oak House", url: "/assets/projects/oak-house.png" },
  { label: "Studio Visuals", url: "/assets/studio/visualisations.jpg" },
  { label: "Concept Plan", url: "/assets/studio/concept-plans.jpg" },
];

const SUGGESTED_SERVICES = [
  "Architectural Design",
  "Interior Design",
  "Working Drawings",
  "3D Visualization",
  "Structural Engineering",
  "MEP Coordination",
  "Landscape Design",
  "Site Supervision",
  "Turnkey Execution",
  "Cost Estimation (BOQ)",
  "Sustainable Architecture",
];


const LOCATION_DATA: Record<string, Record<string, Record<string, string[]>>> = {
  India: {
    Kerala: {
      Ernakulam: [
        "Kochi",
        "Kakkanad",
        "Aluva",
        "Tripunithura",
        "Angamaly",
        "Perumbavoor",
        "Muvattupuzha",
        "North Paravur",
        "Kothamangalam",
        "Edappally",
        "Vyttila",
      ],
      Thiruvananthapuram: [
        "Thiruvananthapuram",
        "Kazhakkoottam",
        "Technopark",
        "Attingal",
        "Neyyattinkara",
        "Varkala",
        "Nedumangad",
        "Kovalam",
      ],
      Kozhikode: [
        "Kozhikode",
        "Vadakara",
        "Koyilandy",
        "Feroke",
        "Ramanattukara",
        "Mavoor",
      ],
      Thrissur: [
        "Thrissur City",
        "Guruvayur",
        "Chalakudy",
        "Irinjalakuda",
        "Kunnamkulam",
        "Kodungallur",
        "Ollur",
      ],
      Kottayam: [
        "Kottayam Town",
        "Changanassery",
        "Pala",
        "Kanjirappally",
        "Ettumanoor",
        "Vaikom",
      ],
      Palakkad: [
        "Palakkad Town",
        "Chittur",
        "Ottapalam",
        "Shoranur",
        "Mannarkkad",
        "Pattambi",
        "Kanjikode",
      ],
      Alappuzha: [
        "Alappuzha Town",
        "Cherthala",
        "Kayamkulam",
        "Mavelikkara",
        "Haripad",
        "Chengannur",
      ],
      Kollam: [
        "Kollam City",
        "Karunagappally",
        "Punalur",
        "Kottarakkara",
        "Paravur",
        "Kundara",
      ],
      Malappuram: [
        "Malappuram Town",
        "Manjeri",
        "Tirur",
        "Perinthalmanna",
        "Ponnani",
        "Kottakkal",
        "Nilambur",
      ],
      Kannur: [
        "Kannur City",
        "Thalassery",
        "Payyanur",
        "Taliparamba",
        "Mattannur",
        "Iritty",
      ],
      Kasaragod: [
        "Kasaragod Town",
        "Kanhangad",
        "Nileshwaram",
        "Uppala",
      ],
      Idukki: [
        "Thodupuzha",
        "Munnar",
        "Kattappana",
        "Adimali",
        "Kumily",
      ],
      Wayanad: [
        "Kalpetta",
        "Sulthan Bathery",
        "Mananthavady",
        "Vythiri",
      ],
      Pathanamthitta: [
        "Pathanamthitta Town",
        "Thiruvalla",
        "Adoor",
        "Ranni",
        "Konni",
      ],
    },
    Karnataka: {
      "Bengaluru Urban": [
        "Bangalore Central",
        "Whitefield",
        "Indiranagar",
        "Koramangala",
        "Electronic City",
        "HSR Layout",
        "Jayanagar",
        "Yelahanka",
        "Hebbal",
        "Sarjapur Road",
      ],
      Mysuru: [
        "Mysore City",
        "Vijayanagar",
        "Jayalakshmipuram",
        "Hunsur",
        "Nanjangud",
      ],
      "Dakshina Kannada": [
        "Mangalore",
        "Surathkal",
        "Bantwal",
        "Puttur",
        "Moodbidri",
      ],
      Udupi: [
        "Udupi Town",
        "Manipal",
        "Kundapura",
        "Karkala",
        "Malpe",
      ],
      Dharwad: [
        "Hubballi",
        "Dharwad City",
        "Navalgund",
      ],
      Belagavi: [
        "Belgaum City",
        "Gokak",
        "Chikodi",
      ],
    },
    "Tamil Nadu": {
      Chennai: [
        "Chennai City",
        "OMR",
        "ECR",
        "Adyar",
        "Anna Nagar",
        "T. Nagar",
        "Velachery",
        "Guindy",
        "Porur",
        "Nungambakkam",
      ],
      Coimbatore: [
        "Coimbatore City",
        "RS Puram",
        "Peelamedu",
        "Gandhipuram",
        "Pollachi",
      ],
      Madurai: [
        "Madurai City",
        "KK Nagar",
        "Anna Nagar",
        "Melur",
      ],
      Kanchipuram: [
        "Kanchipuram Town",
        "Sriperumbudur",
        "Chengalpattu",
      ],
      Tiruchirappalli: [
        "Trichy City",
        "Srirangam",
        "Thillai Nagar",
      ],
      Salem: [
        "Salem City",
        "Fairlands",
        "Attur",
      ],
    },
    Maharashtra: {
      "Mumbai City": [
        "South Mumbai",
        "Worli",
        "Dadar",
        "Lower Parel",
        "Bandra West",
        "Juhu",
        "Santacruz",
      ],
      "Mumbai Suburban": [
        "Andheri East",
        "Andheri West",
        "Powai",
        "Goregaon",
        "Malad",
        "Borivali",
      ],
      Pune: [
        "Pune Central",
        "Baner",
        "Hinjewadi",
        "Koregaon Park",
        "Kothrud",
        "Viman Nagar",
        "Wakad",
      ],
      Thane: [
        "Thane West",
        "Navi Mumbai",
        "Kalyan",
        "Dombivli",
        "Mira-Bhayandar",
      ],
      Nagpur: [
        "Nagpur City",
        "Civil Lines",
        "Dharampeth",
      ],
    },
    Telangana: {
      Hyderabad: [
        "Hyderabad Central",
        "Hitec City",
        "Gachibowli",
        "Jubilee Hills",
        "Banjara Hills",
        "Madhapur",
        "Kondapur",
        "Kukatpally",
      ],
      Rangareddy: [
        "Shamshabad",
        "Manikonda",
        "Rajendranagar",
        "Kokapet",
        "Tellapur",
      ],
      "Medchal-Malkajgiri": [
        "Kompally",
        "Medchal",
        "Alwal",
        "Sainikpuri",
      ],
    },
    "Delhi NCR": {
      "New Delhi": [
        "Central Delhi",
        "Connaught Place",
        "Chanakyapuri",
        "Vasant Kunj",
        "Saket",
        "Hauz Khas",
        "Dwarka",
      ],
      Gurugram: [
        "Cyber City",
        "Golf Course Road",
        "DLF Phase 1-5",
        "Sohna Road",
      ],
      Noida: [
        "Sector 62",
        "Sector 18",
        "Noida Expressway",
        "Greater Noida",
      ],
    },
    Goa: {
      "North Goa": [
        "Panaji",
        "Candolim",
        "Calangute",
        "Mapusa",
        "Porvorim",
        "Anjuna",
        "Assagao",
        "Siolim",
      ],
      "South Goa": [
        "Margao",
        "Vasco da Gama",
        "Colva",
        "Benaulim",
        "Canacona",
      ],
    },
    Gujarat: {
      Ahmedabad: [
        "Ahmedabad Central",
        "SG Highway",
        "Bodakdev",
        "Satellite",
        "Prahlad Nagar",
        "Bopal",
      ],
      Surat: [
        "Surat City",
        "Vesu",
        "Adajan",
        "Varachha",
      ],
      Vadodara: [
        "Vadodara City",
        "Alkapuri",
        "Gotri",
        "Manjalpur",
      ],
    },
    "Andhra Pradesh": {
      Visakhapatnam: [
        "Vizag City",
        "Rushikonda",
        "Madhurawada",
        "Gajuwaka",
      ],
      "NTR (Vijayawada)": [
        "Vijayawada City",
        "Benz Circle",
        "Gollapudi",
      ],
      Guntur: [
        "Guntur City",
        "Amaravati",
        "Mangalagiri",
      ],
    },
    Rajasthan: {
      Jaipur: [
        "Jaipur Central",
        "C-Scheme",
        "Malviya Nagar",
        "Mansarovar",
        "Vaishali Nagar",
      ],
      Udaipur: [
        "Udaipur City",
        "Fatehsagar",
        "Sukher",
        "Hiran Magri",
      ],
    },
    "West Bengal": {
      Kolkata: [
        "Kolkata Central",
        "Salt Lake (Sector V)",
        "New Town (Rajarhat)",
        "Alipore",
        "Ballygunge",
      ],
    },
  },
  "United Arab Emirates": {
    Dubai: {
      Dubai: [
        "Dubai Marina",
        "Downtown Dubai",
        "Palm Jumeirah",
        "Business Bay",
        "Jumeirah",
        "Arabian Ranches",
        "Dubai Hills Estate",
        "DIFC",
      ],
    },
    "Abu Dhabi": {
      "Abu Dhabi": [
        "Abu Dhabi Island",
        "Al Reem Island",
        "Saadiyat Island",
        "Yas Island",
        "Khalifa City",
      ],
    },
    Sharjah: {
      Sharjah: [
        "Sharjah City",
        "Al Majaz",
        "Al Nahda",
        "Muwaileh",
      ],
    },
  },
  "United Kingdom": {
    England: {
      "Greater London": [
        "Central London",
        "Westminster",
        "Kensington & Chelsea",
        "Camden",
        "Greenwich",
      ],
      "Greater Manchester": [
        "Manchester City",
        "Salford",
        "Trafford",
      ],
    },
  },
  "United States": {
    California: {
      "Los Angeles": [
        "Downtown LA",
        "Beverly Hills",
        "Santa Monica",
        "Pasadena",
      ],
      "San Francisco Bay": [
        "San Francisco",
        "Silicon Valley",
        "Palo Alto",
        "San Jose",
      ],
    },
    "New York": {
      "New York City": [
        "Manhattan",
        "Brooklyn",
        "Queens",
      ],
    },
  },
  Singapore: {
    Singapore: {
      "Central Region": [
        "Marina Bay",
        "Orchard",
        "Bukit Timah",
        "Tanjong Pagar",
      ],
      "East Region": [
        "Bedok",
        "Tampines",
        "Marine Parade",
      ],
    },
  },
  "Saudi Arabia": {
    "Riyadh Region": {
      Riyadh: [
        "Riyadh Central",
        "Al Olaya",
        "Al Malqa",
        "KAFD",
      ],
    },
    "Makkah Region": {
      Jeddah: [
        "Jeddah Corniche",
        "Al Rawdah",
        "Al Shati",
      ],
    },
  },
  Qatar: {
    Doha: {
      Doha: [
        "West Bay",
        "The Pearl-Qatar",
        "Lusail",
        "Msheireb Downtown",
      ],
    },
  },
  Australia: {
    "New South Wales": {
      "Greater Sydney": [
        "Sydney CBD",
        "Eastern Suburbs",
        "North Sydney",
        "Parramatta",
      ],
    },
    Victoria: {
      "Greater Melbourne": [
        "Melbourne CBD",
        "South Yarra",
        "Docklands",
        "St Kilda",
      ],
    },
  },
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function PortfolioAddProjectPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [projectType, setProjectType] = useState<ConstructionProjectType>("residential");
  const [status, setStatus] = useState<ConstructionProjectStatus>("completed");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [featured, setFeatured] = useState(false);

  // Location State
  const [country, setCountry] = useState("India");
  const [stateName, setStateName] = useState("Kerala");
  const [district, setDistrict] = useState("Ernakulam");
  const [city, setCity] = useState("Kochi");

  const [customCountry, setCustomCountry] = useState("");
  const [customState, setCustomState] = useState("");
  const [customDistrict, setCustomDistrict] = useState("");
  const [customCity, setCustomCity] = useState("");

  const availableCountries = useMemo(() => Object.keys(LOCATION_DATA), []);

  const availableStates = useMemo(() => {
    return country !== "custom" && LOCATION_DATA[country]
      ? Object.keys(LOCATION_DATA[country])
      : [];
  }, [country]);

  const availableDistricts = useMemo(() => {
    return country !== "custom" &&
      stateName !== "custom" &&
      LOCATION_DATA[country]?.[stateName]
      ? Object.keys(LOCATION_DATA[country][stateName])
      : [];
  }, [country, stateName]);

  const availableCities = useMemo(() => {
    return country !== "custom" &&
      stateName !== "custom" &&
      district !== "custom" &&
      LOCATION_DATA[country]?.[stateName]?.[district]
      ? LOCATION_DATA[country][stateName][district]
      : [];
  }, [country, stateName, district]);

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    if (newCountry !== "custom" && LOCATION_DATA[newCountry]) {
      const firstState = Object.keys(LOCATION_DATA[newCountry])[0] || "";
      setStateName(firstState);
      const firstDistrict =
        firstState
          ? Object.keys(LOCATION_DATA[newCountry][firstState] || {})[0] || ""
          : "";
      setDistrict(firstDistrict);
      const firstCity =
        firstState && firstDistrict
          ? LOCATION_DATA[newCountry][firstState][firstDistrict]?.[0] || ""
          : "";
      setCity(firstCity);
    } else {
      setStateName("custom");
      setDistrict("custom");
      setCity("custom");
    }
  };

  const handleStateChange = (newState: string) => {
    setStateName(newState);
    if (
      newState !== "custom" &&
      country !== "custom" &&
      LOCATION_DATA[country]?.[newState]
    ) {
      const firstDistrict =
        Object.keys(LOCATION_DATA[country][newState])[0] || "";
      setDistrict(firstDistrict);
      const firstCity =
        firstDistrict
          ? LOCATION_DATA[country][newState][firstDistrict]?.[0] || ""
          : "";
      setCity(firstCity);
    } else {
      setDistrict("custom");
      setCity("custom");
    }
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    if (
      newDistrict !== "custom" &&
      country !== "custom" &&
      stateName !== "custom" &&
      LOCATION_DATA[country]?.[stateName]?.[newDistrict]
    ) {
      const firstCity =
        LOCATION_DATA[country][stateName][newDistrict][0] || "";
      setCity(firstCity);
    } else {
      setCity("custom");
    }
  };

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
  };

  const effectiveCountry = country === "custom" ? customCountry.trim() : country;
  const effectiveState = stateName === "custom" ? customState.trim() : stateName;
  const effectiveDistrict = district === "custom" ? customDistrict.trim() : district;
  const effectiveCity = city === "custom" ? customCity.trim() : city;

  // Dimensions & Scale
  const [builtUpAreaValue, setBuiltUpAreaValue] = useState<number | "">("");
  const [builtUpAreaUnit, setBuiltUpAreaUnit] = useState<ConstructionAreaUnit>("sq_ft");
  const [siteAreaValue, setSiteAreaValue] = useState<number | "">("");
  const [siteAreaUnit, setSiteAreaUnit] = useState<ConstructionSiteAreaUnit>("cent");
  const [floors, setFloors] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  // Timeline
  const [completionYear, setCompletionYear] = useState<number>(new Date().getFullYear());
  const [duration, setDuration] = useState("");
  const [constructionStage, setConstructionStage] = useState("Completed");

  // Media
  const [coverImage, setCoverImage] = useState<string>(PRESET_COVERS[0].url);
  const [gallery, setGallery] = useState<PortfolioGalleryItem[]>([
    {
      id: "gal-1",
      url: PRESET_COVERS[0].url,
      category: "Exterior",
      caption: "Front elevation perspective",
    },
    {
      id: "gal-2",
      url: PRESET_COVERS[1].url,
      category: "Interior",
      caption: "Living & dining courtyard area",
    },
  ]);

  // Services
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customServiceInput, setCustomServiceInput] = useState("");

  // Highlights
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlightInput, setNewHighlightInput] = useState("");

  // Narrative
  const [description, setDescription] = useState("");
  const [vision, setVision] = useState("");
  const [approach, setApproach] = useState("");

  // Validation & UI State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string>("");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManual) {
      setSlug(slugify(val));
    }
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: "" }));
    }
  };

  const handleCoverFileUpload = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setCoverImage(objectUrl);
    setGallery((prev) => {
      const exists = prev.some((g) => g.url === objectUrl);
      if (!exists) {
        return [
          {
            id: `custom-cover-${Date.now()}`,
            url: objectUrl,
            category: "Exterior",
            caption: file.name.replace(/\.[^/.]+$/, ""),
          },
          ...prev,
        ];
      }
      return prev;
    });
  };

  const handleGalleryUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: PortfolioGalleryItem[] = Array.from(files).map((file, idx) => ({
      id: `custom-gal-${Date.now()}-${idx}`,
      url: URL.createObjectURL(file),
      category: "Exterior",
      caption: file.name.replace(/\.[^/.]+$/, ""),
    }));
    setGallery((prev) => {
      const updated = [...prev, ...newItems];
      if (!coverImage && newItems.length > 0) {
        setCoverImage(newItems[0].url);
      }
      return updated;
    });
  };

  const toggleService = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((s) => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const addCustomService = () => {
    const trimmed = customServiceInput.trim();
    if (trimmed && !selectedServices.includes(trimmed)) {
      setSelectedServices((prev) => [...prev, trimmed]);
      setCustomServiceInput("");
    }
  };


  const addHighlight = () => {
    const trimmed = newHighlightInput.trim();
    if (trimmed) {
      setHighlights((prev) => [...prev, trimmed]);
      setNewHighlightInput("");
    }
  };

  const removeHighlight = (idx: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== idx));
  };


  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = "Project title is required";
    }
    if (!effectiveCity) {
      newErrors.city = "City is required";
    }
    if (!effectiveState) {
      newErrors.state = "State is required";
    }
    if (!description.trim()) {
      newErrors.description = "Project description is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (targetStatus: ConstructionProjectStatus = status) => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    const projectId = slug || slugify(title) || `project-${Date.now()}`;

    const newProject: PortfolioProject = {
      id: projectId,
      title: title.trim(),
      slug: slug || slugify(title),
      projectType,
      status: targetStatus,
      visibility,
      featured,
      location: {
        city: effectiveCity,
        district: effectiveDistrict || undefined,
        state: effectiveState,
        country: effectiveCountry || "India",
      },
      builtUpArea:
        typeof builtUpAreaValue === "number" && builtUpAreaValue > 0
          ? { value: builtUpAreaValue, unit: builtUpAreaUnit }
          : { value: 3200, unit: "sq_ft" },
      siteArea:
        typeof siteAreaValue === "number" && siteAreaValue > 0
          ? { value: siteAreaValue, unit: siteAreaUnit }
          : undefined,
      floors: floors.trim() || "2 Floors",
      bedrooms: bedrooms.trim() || "4 BHK",
      completionYear: Number(completionYear) || new Date().getFullYear(),
      duration: duration.trim() || "12 months",
      constructionStage: constructionStage.trim() || "Completed",
      services: selectedServices,
      description: description.trim(),
      designHighlights: highlights,
      materials: [],
      materialItems: [],
      coverImage: coverImage || PRESET_COVERS[0].url,
      gallery: gallery.length > 0 ? gallery.map((g) => g.url) : [coverImage],
      detailedGallery: gallery,
      editorialSummary: {
        vision: vision.trim(),
        approach: approach.trim(),
        context: `${effectiveCity}, ${effectiveState}`,
      },
      collaborators: [],
      tags: [formatProjectType(projectType), effectiveCity, effectiveState, "Architecture"].filter(Boolean),
    };

    addPortfolioProject(newProject);
    setCreatedProjectId(projectId);
    setIsSubmitting(false);
    setShowSuccessModal(true);
  };

  return (
    <div className={styles.pageWrapper}>
      {/* ─── Breadcrumbs & Header Actions ───────────────── */}
      <nav className={styles.topNav} aria-label="Breadcrumb">
        <div className={styles.breadcrumbsGroup}>
          <Link href="/portfolio" className={styles.breadcrumbLink}>
            Portfolio
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link
            href="/portfolio?portfolioTab=projects"
            className={styles.breadcrumbLink}
          >
            Projects
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>Add Project</span>
        </div>

        <div className={styles.actionButtonsGroup}>
          <Link href="/portfolio?portfolioTab=projects" className={styles.secondaryButton}>
            Cancel
          </Link>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => handleSubmit("draft")}
            disabled={isSubmitting}
          >
            Save as Draft
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => handleSubmit(status)}
            disabled={isSubmitting}
          >
            <Sparkles size={14} aria-hidden="true" />
            Publish Project
          </button>
        </div>
      </nav>

      {/* ─── Page Title Header ──────────────────────────── */}
      <header className={styles.headerTitleSection}>
        <h1 className={styles.pageHeading}>Add Project to Portfolio</h1>
        <p className={styles.pageSubtitle}>
          Showcase your architectural design, interior planning and coordinated project
          milestones to clients and prospective collaborators.
        </p>
      </header>

      {/* ─── Main Grid: Form Column & Live Preview Column ─ */}
      <div className={styles.mainGrid}>
        <div className={styles.formColumn}>
          {/* Section 1: General & Classification */}
          <section className={styles.formSectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <div className={styles.sectionIconWrapper}>
                  <Building2 size={18} aria-hidden="true" />
                </div>
                <div>
                  <h2 className={styles.sectionTitle}>Project Overview & Classification</h2>
                  <p className={styles.sectionSubtitle}>
                    Basic identity, category, and public visibility settings.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="project-title-input" className={styles.fieldLabel}>
                Project Title <span className={styles.requiredAsterisk}>*</span>
              </label>
              <input
                id="project-title-input"
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Nila Courtyard Residence"
                className={styles.textInput}
              />
              {errors.title && <span className={styles.errorText}>{errors.title}</span>}
            </div>

            <div className={styles.formGrid2}>
              <div className={styles.fieldGroup}>
                <label htmlFor="project-slug-input" className={styles.fieldLabel}>
                  URL Slug
                </label>
                <input
                  id="project-slug-input"
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugManual(true);
                  }}
                  placeholder="nila-courtyard-residence"
                  className={styles.textInput}
                />
                <span className={styles.fieldHint}>
                  Auto-generated from title for the project URL link.
                </span>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="project-status-select" className={styles.fieldLabel}>
                  Project Status
                </label>
                <select
                  id="project-status-select"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as ConstructionProjectStatus)
                  }
                  className={styles.selectInput}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.status} value={opt.status}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>Project Category</span>
              <div className={styles.categoryPillsRow} role="radiogroup">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = projectType === cat.type;
                  return (
                    <button
                      key={cat.type}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`${styles.categorySelectPill} ${
                        isSelected ? styles.categorySelectPillActive : ""
                      }`}
                      onClick={() => setProjectType(cat.type)}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.formGrid2}>
              <div className={styles.toggleRow}>
                <div className={styles.toggleLabelGroup}>
                  <span className={styles.toggleTitle}>Public Visibility</span>
                  <span className={styles.toggleSubtitle}>
                    Visible on public portfolio profile
                  </span>
                </div>
                <label className={styles.switchControl}>
                  <input
                    type="checkbox"
                    checked={visibility === "public"}
                    onChange={(e) =>
                      setVisibility(e.target.checked ? "public" : "private")
                    }
                    aria-label="Toggle public visibility"
                  />
                  <span className={styles.slider} />
                </label>
              </div>

              <div className={styles.toggleRow}>
                <div className={styles.toggleLabelGroup}>
                  <span className={styles.toggleTitle}>Featured Project</span>
                  <span className={styles.toggleSubtitle}>
                    Highlight at the top of showcase grids
                  </span>
                </div>
                <label className={styles.switchControl}>
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    aria-label="Toggle featured project status"
                  />
                  <span className={styles.slider} />
                </label>
              </div>
            </div>
          </section>

          {/* Section 2: Location & Area Specs */}
          <section className={styles.formSectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <div className={styles.sectionIconWrapper}>
                  <MapPin size={18} aria-hidden="true" />
                </div>
                <div>
                  <h2 className={styles.sectionTitle}>Location & Scale Specifications</h2>
                  <p className={styles.sectionSubtitle}>
                    Physical location, built-up dimensions, and spatial configuration.
                  </p>
                </div>
              </div>
            </div>

            {/* Cascading Location Dropdowns: Country -> State -> District -> City */}
            <div className={styles.formGrid4}>
              <div className={styles.fieldGroup}>
                <label htmlFor="country-select" className={styles.fieldLabel}>
                  Country
                </label>
                <select
                  id="country-select"
                  value={country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className={styles.selectInput}
                >
                  {availableCountries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="custom">+ Other Country</option>
                </select>
                {country === "custom" && (
                  <input
                    type="text"
                    value={customCountry}
                    onChange={(e) => setCustomCountry(e.target.value)}
                    placeholder="Enter country name"
                    className={styles.textInput}
                    style={{ marginTop: 6 }}
                  />
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="state-select" className={styles.fieldLabel}>
                  State <span className={styles.requiredAsterisk}>*</span>
                </label>
                <select
                  id="state-select"
                  value={stateName}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className={styles.selectInput}
                >
                  {availableStates.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value="custom">+ Other State</option>
                </select>
                {stateName === "custom" && (
                  <input
                    type="text"
                    value={customState}
                    onChange={(e) => setCustomState(e.target.value)}
                    placeholder="Enter state name"
                    className={styles.textInput}
                    style={{ marginTop: 6 }}
                  />
                )}
                {errors.state && <span className={styles.errorText}>{errors.state}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="district-select" className={styles.fieldLabel}>
                  District
                </label>
                <select
                  id="district-select"
                  value={district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className={styles.selectInput}
                >
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                  <option value="custom">+ Other District</option>
                </select>
                {district === "custom" && (
                  <input
                    type="text"
                    value={customDistrict}
                    onChange={(e) => setCustomDistrict(e.target.value)}
                    placeholder="Enter district name"
                    className={styles.textInput}
                    style={{ marginTop: 6 }}
                  />
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="city-select" className={styles.fieldLabel}>
                  City <span className={styles.requiredAsterisk}>*</span>
                </label>
                <select
                  id="city-select"
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className={styles.selectInput}
                >
                  {availableCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="custom">+ Other City / Locality</option>
                </select>
                {city === "custom" && (
                  <input
                    type="text"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    placeholder="Enter city / locality name"
                    className={styles.textInput}
                    style={{ marginTop: 6 }}
                  />
                )}
                {errors.city && <span className={styles.errorText}>{errors.city}</span>}
              </div>
            </div>

            <div className={styles.formGrid4}>
              <div className={styles.fieldGroup}>
                <label htmlFor="builtup-input" className={styles.fieldLabel}>
                  Built-up Area
                </label>
                <div className={styles.unitInputGroup}>
                  <input
                    id="builtup-input"
                    type="number"
                    value={builtUpAreaValue}
                    onChange={(e) =>
                      setBuiltUpAreaValue(
                        e.target.value ? Number(e.target.value) : ""
                      )
                    }
                    placeholder="3200"
                    className={styles.textInput}
                  />
                  <select
                    value={builtUpAreaUnit}
                    onChange={(e) =>
                      setBuiltUpAreaUnit(e.target.value as ConstructionAreaUnit)
                    }
                    className={styles.unitSelect}
                    aria-label="Built-up area unit"
                  >
                    <option value="sq_ft">sq ft</option>
                    <option value="sq_m">sq m</option>
                  </select>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="sitearea-input" className={styles.fieldLabel}>
                  Site Area
                </label>
                <div className={styles.unitInputGroup}>
                  <input
                    id="sitearea-input"
                    type="number"
                    value={siteAreaValue}
                    onChange={(e) =>
                      setSiteAreaValue(
                        e.target.value ? Number(e.target.value) : ""
                      )
                    }
                    placeholder="8.5"
                    className={styles.textInput}
                  />
                  <select
                    value={siteAreaUnit}
                    onChange={(e) =>
                      setSiteAreaUnit(e.target.value as ConstructionSiteAreaUnit)
                    }
                    className={styles.unitSelect}
                    aria-label="Site area unit"
                  >
                    <option value="cent">cent</option>
                    <option value="acre">acre</option>
                    <option value="sq_ft">sq ft</option>
                    <option value="sq_m">sq m</option>
                  </select>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="floors-input" className={styles.fieldLabel}>
                  Floors
                </label>
                <input
                  id="floors-input"
                  type="text"
                  value={floors}
                  onChange={(e) => setFloors(e.target.value)}
                  placeholder="2 Floors (G+1)"
                  className={styles.textInput}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="bedrooms-input" className={styles.fieldLabel}>
                  Bedrooms / Configuration
                </label>
                <input
                  id="bedrooms-input"
                  type="text"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  placeholder="4 BHK + Study"
                  className={styles.textInput}
                />
              </div>
            </div>

            <div className={styles.formGrid3}>
              <div className={styles.fieldGroup}>
                <label htmlFor="completion-year-input" className={styles.fieldLabel}>
                  Completion Year
                </label>
                <input
                  id="completion-year-input"
                  type="number"
                  value={completionYear}
                  onChange={(e) => setCompletionYear(Number(e.target.value))}
                  placeholder="2026"
                  className={styles.textInput}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="duration-input" className={styles.fieldLabel}>
                  Project Duration
                </label>
                <input
                  id="duration-input"
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="14 months"
                  className={styles.textInput}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="stage-input" className={styles.fieldLabel}>
                  Construction Stage
                </label>
                <input
                  id="stage-input"
                  type="text"
                  value={constructionStage}
                  onChange={(e) => setConstructionStage(e.target.value)}
                  placeholder="Completed / Handover"
                  className={styles.textInput}
                />
              </div>
            </div>
          </section>

          {/* Section 3: Media & Visual Assets */}
          <section className={styles.formSectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <div className={styles.sectionIconWrapper}>
                  <ImageIcon size={18} aria-hidden="true" />
                </div>
                <div>
                  <h2 className={styles.sectionTitle}>Cover Image & Media Assets</h2>
                  <p className={styles.sectionSubtitle}>
                    Upload high-resolution architectural photography or select from presets.
                  </p>
                </div>
              </div>
            </div>

            {/* Cover Image Upload */}
            <div className={styles.coverUploadContainer}>
              <span className={styles.fieldLabel}>Cover Banner Photo</span>

              {coverImage ? (
                <div className={styles.coverPreviewBanner}>
                  <Image
                    src={coverImage}
                    alt="Cover preview"
                    fill
                    className={styles.coverPreviewImg}
                  />
                  <button
                    type="button"
                    className={styles.removeCoverBtn}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={12} aria-hidden="true" />
                    Change Cover
                  </button>
                </div>
              ) : (
                <div
                  className={styles.dropzone}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <Upload size={24} className={styles.dropzoneIcon} aria-hidden="true" />
                  <span className={styles.dropzoneTitle}>
                    Click to upload main cover image
                  </span>
                  <span className={styles.dropzoneHint}>
                    PNG, JPG, or WebP up to 10MB (16:9 recommended)
                  </span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCoverFileUpload(file);
                }}
              />

              {/* Presets Row -> Pick from Uploaded Gallery Photos */}
              <div className={styles.fieldGroup}>
                <span className={styles.fieldHint}>
                  {gallery.length > 0
                    ? "Pick cover photo from project gallery:"
                    : "Or pick from architectural library presets:"}
                </span>
                <div className={styles.presetsRow}>
                  {gallery.length > 0
                    ? gallery.map((item, idx) => {
                        const isActive = coverImage === item.url;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`${styles.presetThumbnailBtn} ${
                              isActive ? styles.presetThumbnailActive : ""
                            }`}
                            onClick={() => setCoverImage(item.url)}
                            title={item.caption || `Gallery photo ${idx + 1}`}
                          >
                            <Image
                              src={item.url}
                              alt={item.caption || `Gallery ${idx + 1}`}
                              fill
                              className={styles.coverPreviewImg}
                              sizes="72px"
                            />
                          </button>
                        );
                      })
                    : PRESET_COVERS.map((preset) => {
                        const isActive = coverImage === preset.url;
                        return (
                          <button
                            key={preset.url}
                            type="button"
                            className={`${styles.presetThumbnailBtn} ${
                              isActive ? styles.presetThumbnailActive : ""
                            }`}
                            onClick={() => setCoverImage(preset.url)}
                            title={preset.label}
                          >
                            <Image
                              src={preset.url}
                              alt={preset.label}
                              fill
                              className={styles.coverPreviewImg}
                              sizes="72px"
                            />
                          </button>
                        );
                      })}
                </div>
              </div>
            </div>

            {/* Gallery Uploader */}
            <div className={styles.fieldGroup} style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className={styles.fieldLabel}>Project Gallery & Drawings ({gallery.length})</span>
                <button
                  type="button"
                  className={styles.addListItemBtn}
                  onClick={() => galleryFileInputRef.current?.click()}
                >
                  <Plus size={13} aria-hidden="true" />
                  Add photos
                </button>
              </div>

              <input
                ref={galleryFileInputRef}
                type="file"
                multiple
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleGalleryUpload(e.target.files)}
              />

              {gallery.length > 0 ? (
                <div className={styles.galleryGrid}>
                  {gallery.map((item, idx) => {
                    const isCover = coverImage === item.url;
                    return (
                      <div key={item.id} className={styles.galleryCard}>
                        <div className={styles.galleryCardImgWrapper}>
                          <Image
                            src={item.url}
                            alt={item.caption || `Gallery ${idx + 1}`}
                            fill
                            className={styles.coverPreviewImg}
                            sizes="180px"
                          />
                          {isCover ? (
                            <span className={styles.galleryCardCoverBadge}>
                              ★ Cover Photo
                            </span>
                          ) : (
                            <button
                              type="button"
                              className={styles.galleryCardSetCoverBtn}
                              onClick={() => setCoverImage(item.url)}
                              title="Set as project cover photo"
                            >
                              Set as cover
                            </button>
                          )}
                          <button
                            type="button"
                            className={styles.galleryCardRemoveBtn}
                            onClick={() => {
                              setGallery((prev) => prev.filter((g) => g.id !== item.id));
                              if (isCover) {
                                const remaining = gallery.filter((g) => g.id !== item.id);
                                if (remaining.length > 0) {
                                  setCoverImage(remaining[0].url);
                                }
                              }
                            }}
                            aria-label="Remove photo"
                          >
                            <X size={12} aria-hidden="true" />
                          </button>
                        </div>
                      <div className={styles.galleryCardControls}>
                        <select
                          value={item.category}
                          onChange={(e) => {
                            const newCategory = e.target.value as PortfolioGalleryItem["category"];
                            setGallery((prev) =>
                              prev.map((g) =>
                                g.id === item.id ? { ...g, category: newCategory } : g
                              )
                            );
                          }}
                          className={styles.galleryCardSelect}
                          aria-label="Photo category"
                        >
                          <option value="Exterior">Exterior</option>
                          <option value="Interior">Interior</option>
                          <option value="Floor Plans">Floor Plans</option>
                          <option value="3D Visuals">3D Visuals</option>
                          <option value="Construction Progress">Progress</option>
                        </select>
                        <input
                          type="text"
                          value={item.caption}
                          onChange={(e) => {
                            const newCap = e.target.value;
                            setGallery((prev) =>
                              prev.map((g) =>
                                g.id === item.id ? { ...g, caption: newCap } : g
                              )
                            );
                          }}
                          placeholder="Caption..."
                          className={styles.galleryCardCaptionInput}
                          aria-label="Photo caption"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              ) : (
                <span className={styles.fieldHint}>
                  No gallery photos added yet. Add photos to show drawings, interior spaces and construction milestones.
                </span>
              )}
            </div>
          </section>

          {/* Section 4: Services & Scope */}
          <section className={styles.formSectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <div className={styles.sectionIconWrapper}>
                  <Layers size={18} aria-hidden="true" />
                </div>
                <div>
                  <h2 className={styles.sectionTitle}>Scope of Services & Highlights</h2>
                  <p className={styles.sectionSubtitle}>
                    Deliverable scope, specialized consulting, and architectural highlights.
                  </p>
                </div>
              </div>
            </div>

            {/* Services Tags */}
            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>Services Provided</span>
              <div className={styles.tagsList}>
                {SUGGESTED_SERVICES.map((srv) => {
                  const isSelected = selectedServices.includes(srv);
                  return (
                    <button
                      key={srv}
                      type="button"
                      className={`${styles.tagChip} ${
                        isSelected ? styles.tagChipSelected : ""
                      }`}
                      onClick={() => toggleService(srv)}
                    >
                      {srv}
                      {isSelected ? " ✓" : ""}
                    </button>
                  );
                })}
              </div>

              <div className={styles.addTagInline}>
                <input
                  type="text"
                  value={customServiceInput}
                  onChange={(e) => setCustomServiceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomService();
                    }
                  }}
                  placeholder="Add custom service (e.g. Acoustic Engineering)..."
                  className={styles.addTagInput}
                />
                <button
                  type="button"
                  className={styles.addTagBtn}
                  onClick={addCustomService}
                >
                  + Add Service
                </button>
              </div>
            </div>

            {/* Design Highlights */}
            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>Architectural Design Highlights</span>
              <div className={styles.dynamicList}>
                {highlights.map((hl, idx) => (
                  <div key={idx} className={styles.dynamicListItem}>
                    <input
                      type="text"
                      value={hl}
                      onChange={(e) => {
                        const next = [...highlights];
                        next[idx] = e.target.value;
                        setHighlights(next);
                      }}
                      className={styles.textInput}
                    />
                    <button
                      type="button"
                      className={styles.dynamicListRemoveBtn}
                      onClick={() => removeHighlight(idx)}
                      aria-label="Remove highlight"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>

              <div className={styles.addTagInline}>
                <input
                  type="text"
                  value={newHighlightInput}
                  onChange={(e) => setNewHighlightInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addHighlight();
                    }
                  }}
                  placeholder="Add architectural feature (e.g. Double-height light well)..."
                  className={styles.addTagInput}
                />
                <button
                  type="button"
                  className={styles.addTagBtn}
                  onClick={addHighlight}
                >
                  + Add Highlight
                </button>
              </div>
            </div>
          </section>

          {/* Section 5: Narrative & Description */}
          <section className={styles.formSectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <div className={styles.sectionIconWrapper}>
                  <FileText size={18} aria-hidden="true" />
                </div>
                <div>
                  <h2 className={styles.sectionTitle}>Project Narrative & Editorial Summary</h2>
                  <p className={styles.sectionSubtitle}>
                    Tell the architectural story, client brief, and design solutions.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="description-input" className={styles.fieldLabel}>
                Project Summary / Overview <span className={styles.requiredAsterisk}>*</span>
              </label>
              <textarea
                id="description-input"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) {
                    setErrors((prev) => ({ ...prev, description: "" }));
                  }
                }}
                placeholder="Provide a comprehensive summary of the project, brief, and spatial layout..."
                className={styles.textareaInput}
                rows={3}
              />
              {errors.description && (
                <span className={styles.errorText}>{errors.description}</span>
              )}
            </div>

            <div className={styles.formGrid2}>
              <div className={styles.fieldGroup}>
                <label htmlFor="vision-input" className={styles.fieldLabel}>
                  Design Vision
                </label>
                <textarea
                  id="vision-input"
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  placeholder="The guiding architectural philosophy..."
                  className={styles.textareaInput}
                  rows={2}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="approach-input" className={styles.fieldLabel}>
                  Architectural Approach
                </label>
                <textarea
                  id="approach-input"
                  value={approach}
                  onChange={(e) => setApproach(e.target.value)}
                  placeholder="How climate, structure and spatial flow were solved..."
                  className={styles.textareaInput}
                  rows={2}
                />
              </div>
            </div>
          </section>


        </div>

        {/* ─── Right Sidebar Live Preview ─────────────────── */}
        <aside className={styles.previewSidebar}>
          <div className={styles.previewCardHeader}>
            <span className={styles.previewBadge}>
              <Eye size={12} style={{ display: "inline", marginRight: 4 }} />
              Live Card Preview
            </span>
            <span style={{ fontSize: 11.5, color: "#64748b" }}>
              How it appears in portfolio
            </span>
          </div>

          <div className={styles.livePreviewCard}>
            <div className={styles.previewMedia}>
              <Image
                src={coverImage || PRESET_COVERS[0].url}
                alt="Live preview"
                fill
                className={styles.previewCoverImg}
                sizes="360px"
              />
              <span className={styles.previewCategoryTag}>
                {formatProjectType(projectType)}
              </span>
            </div>

            <div className={styles.previewContent}>
              <div className={styles.previewMetaRow}>
                <span>
                  {effectiveCity || "City"}, {effectiveState || "State"}
                </span>
                <span>{completionYear}</span>
              </div>

              <h3 className={styles.previewProjectTitle}>
                {title || "Untitled Project"}
              </h3>

              <p className={styles.previewProjectDesc}>
                {description || "Project summary description will display here."}
              </p>

              {selectedServices.length > 0 && (
                <div className={styles.previewTagsRow}>
                  {selectedServices.slice(0, 3).map((srv) => (
                    <span key={srv} className={styles.previewMiniTag}>
                      {srv}
                    </span>
                  ))}
                  {selectedServices.length > 3 && (
                    <span className={styles.previewMiniTag}>
                      +{selectedServices.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            <button
              type="button"
              className={styles.primaryButton}
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => handleSubmit(status)}
              disabled={isSubmitting}
            >
              <Sparkles size={14} aria-hidden="true" />
              Publish Project
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => handleSubmit("draft")}
              disabled={isSubmitting}
            >
              Save as Draft
            </button>
          </div>
        </aside>
      </div>

      {/* ─── Success Dialog Modal ───────────────────────── */}
      {showSuccessModal && (
        <div className={styles.successModalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.successModalCard}>
            <div className={styles.successIconWrapper}>
              <CheckCircle2 size={32} aria-hidden="true" />
            </div>
            <h3 className={styles.successTitle}>Project Published!</h3>
            <p className={styles.successDesc}>
              <strong>{title}</strong> has been successfully added to your portfolio and
              is now visible in your projects showcase.
            </p>
            <div className={styles.successActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => router.push("/portfolio?portfolioTab=projects")}
              >
                Back to Portfolio
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() =>
                  router.push(`/portfolio/projects/${createdProjectId}`)
                }
              >
                View Project Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
