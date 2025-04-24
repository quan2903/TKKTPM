"use client";

import { useEffect, useState } from "react";
import { MainHeaderCard } from "./MainHeaderCard";
import axios from "axios";

// Dữ liệu mẫu
const SAMPLE_FIELDS = [
  {
    id: "field-001",
    name: "Sân bóng A",
    address: "123 Đường ABC, Quận 1",
    price: 200000,
    rating: 4.5,
    image: "/field-sample-1.jpg",
    usage: 75,
    state: { id: "state-001" }
  },
  {
    id: "field-002",
    name: "Sân bóng B",
    address: "456 Đường XYZ, Quận 2",
    price: 180000,
    rating: 4.2,
    image: "/field-sample-2.jpg",
    usage: 60,
    state: { id: "state-001" }
  },
  {
    id: "field-003",
    name: "Sân bóng C",
    address: "789 Đường DEF, Quận 3",
    price: 220000,
    rating: 4.7,
    image: "/field-sample-3.jpg",
    usage: 85,
    state: { id: "state-001" }
  },
  {
    id: "field-004",
    name: "Sân bóng D",
    address: "101 Đường GHI, Quận 4",
    price: 190000,
    rating: 4.3,
    image: "/field-sample-4.jpg",
    usage: 55,
    state: { id: "state-001" }
  }
];

export function FieldList() {
  const [fields, setFields] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/fields?per_page=12&page=1")
      .then((response) => {
        const fieldList = response.data.data;
        const filteredList = fieldList.filter((field: any) => field.state?.id === "state-001");

        const dataWithUsage = filteredList.map((field: any) => ({
          ...field,
          usage: Math.floor(Math.random() * 100),
        }));

        setFields(dataWithUsage);
      })
      .catch((error) => {
        console.error("Error fetching fields, using sample data:", error);
        // Sử dụng dữ liệu mẫu khi API fail
        setFields(SAMPLE_FIELDS);
      });
  }, []);

  return (
    <section className="mt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {fields.map((field: any) => (
          <MainHeaderCard key={field.id} field={field} />
        ))}
      </div>
    </section>
  );
}