"use client";
import { useState } from "react";

const TYPE_LABELS = {
    box_exterior: "Box Exterior",
    box_interior: "Box Interior",
    product: "Product",
    serial_number: "Serial Number",
    defect: "Defect",
    return: "Return",
};

export default function PhotoGallery({ photos = [] }) {
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    if (photos.length === 0) {
        return (
            <div
                style={{
                    padding: "32px",
                    textAlign: "center",
                    color: "var(--stone2)",
                    fontSize: "0.88rem",
                    background: "var(--sand)",
                    borderRadius: "16px",
                    border: "1px dashed var(--sand3)",
                }}
            >
                No inspection photos yet
            </div>
        );
    }

    return (
        <>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: "12px",
                }}
            >
                {photos.map((photo) => (
                    <div
                        key={photo.id}
                        onClick={() => setSelectedPhoto(photo)}
                        style={{
                            cursor: "pointer",
                            borderRadius: "12px",
                            overflow: "hidden",
                            border: "1px solid var(--sand3)",
                            transition: "transform 0.2s, box-shadow 0.2s",
                            position: "relative",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 6px 20px rgba(59,47,30,0.1)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "none";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    >
                        <img
                            src={photo.photo_url}
                            alt={TYPE_LABELS[photo.photo_type] || photo.photo_type}
                            style={{
                                width: "100%",
                                height: "120px",
                                objectFit: "cover",
                                display: "block",
                            }}
                        />
                        <div
                            style={{
                                padding: "8px 10px",
                                background: "var(--white)",
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                color: "var(--bark)",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                            }}
                        >
                            {TYPE_LABELS[photo.photo_type] || photo.photo_type}
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {selectedPhoto && (
                <div
                    onClick={() => setSelectedPhoto(null)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(59,47,30,0.85)",
                        zIndex: 1000,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "40px",
                        cursor: "pointer",
                        animation: "fadeIn 0.2s ease",
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: "800px",
                            maxHeight: "80vh",
                            borderRadius: "16px",
                            overflow: "hidden",
                            background: "var(--white)",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                        }}
                    >
                        <img
                            src={selectedPhoto.photo_url}
                            alt={TYPE_LABELS[selectedPhoto.photo_type]}
                            style={{
                                width: "100%",
                                maxHeight: "70vh",
                                objectFit: "contain",
                                display: "block",
                            }}
                        />
                        <div
                            style={{
                                padding: "16px 20px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "0.82rem",
                                    fontWeight: 700,
                                    color: "var(--bark)",
                                }}
                            >
                                {TYPE_LABELS[selectedPhoto.photo_type]}
                            </span>
                            <span
                                style={{
                                    fontSize: "0.75rem",
                                    color: "var(--stone)",
                                }}
                            >
                                {new Date(selectedPhoto.taken_at).toLocaleString("en-IN")}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
