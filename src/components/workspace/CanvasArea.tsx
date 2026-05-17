import React, { useState, useEffect, useRef } from "react";
import { ITEMS, INITIAL_CONNECTORS, getPoint, getPath } from "./canvasUtils";
import {
  Pin,
  PinOff,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Plus,
  FileText,
  BarChart3,
  Clock,
  Users,
  Link2,
  MoreHorizontal,
  Database,
  RefreshCw,
} from "lucide-react";

const SystemFooter = ({
  system,
  status,
  time,
  category,
  dbEntity,
}: {
  system: string;
  status: "syncing" | "synced" | "local" | "error";
  time?: string;
  category?: string;
  dbEntity?: string;
}) => {
  return (
    <div
      style={{
        marginTop: "12px",
        paddingTop: "8px",
        borderTop: "1px solid var(--line)",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      {category && dbEntity && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "10px",
            color: "var(--muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span style={{ color: "var(--brass)" }}>[{category}]</span>
          <span>{dbEntity}</span>
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "10px",
          color: "var(--muted)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {status === "synced" ? (
            <Database size={10} color="#10b981" />
          ) : status === "syncing" ? (
            <RefreshCw
              size={10}
              style={{ animation: "spin 2s linear infinite" }}
              color="var(--brass)"
            />
          ) : status === "error" ? (
            <Database size={10} color="#f87171" />
          ) : (
            <Database size={10} />
          )}
          <span>{system}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {status === "synced" && (
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#10b981",
                opacity: 0.8,
              }}
            />
          )}
          {status === "error" && (
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#f87171",
                opacity: 0.8,
              }}
            />
          )}
          <span>
            {time ||
              (status === "synced"
                ? "Live sync"
                : status === "syncing"
                  ? "Syncing..."
                  : status === "error"
                    ? "Sync failed"
                    : "Local data")}
          </span>
        </div>
      </div>
    </div>
  );
};

export interface CanvasAreaProps {
  activeWorkspaceId: string;
}

export function CanvasArea({ activeWorkspaceId }: CanvasAreaProps) {
  const [hoveredConnector, setHoveredConnector] = useState<string | null>(null);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [draggedEvidenceDoc, setDraggedEvidenceDoc] = useState<any>(null);
  const [linkedEvidenceDocs, setLinkedEvidenceDocs] = useState<any[]>([]);
  const [isDragOverDropZone, setIsDragOverDropZone] = useState(false);
  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const [localItems, setLocalItems] = useState<Record<string, any>>({});
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionBox, setSelectionBox] = useState<{ startX: number, startY: number, currentX: number, currentY: number } | null>(null);
  const [dragStartCursor, setDragStartCursor] = useState<{ x: number, y: number } | null>(null);
  const [dragStartItems, setDragStartItems] = useState<Record<string, { x: number, y: number }>>({});

  // Infinite Canvas Camera State
  const containerRef = useRef<HTMLDivElement>(null);
  // Default camera slightly inset
  const [camera, setCamera] = useState({ x: 50, y: 30, z: 1 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    fetch(`/api/workspace/${activeWorkspaceId}`)
      .then((res) => res.json())
      .then((data) => {
        setWorkspaceData(data);
        if (data?.canvas?.items) {
          setLocalItems(data.canvas.items);
        }
      })
      .catch((err) => console.error(err));
  }, [activeWorkspaceId]);

  // Spacebar tracking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Spacebar only if we aren't typing in an input
      if (
        e.code === "Space" &&
        !e.repeat &&
        document.activeElement === document.body
      ) {
        setIsSpacePressed(true);
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Keyboard Shortcuts (Delete, Duplicate, Select All)
  useEffect(() => {
    const handleActionKeys = (e: KeyboardEvent) => {
      // Don't trigger if inside input
      const activeTagName = document.activeElement?.tagName.toLowerCase();
      if (activeTagName === "input" || activeTagName === "textarea") return;

      if (e.key === "Backspace" || e.key === "Delete") {
        if (selectedIds.length > 0) {
          setLocalItems(prev => {
            const next = { ...prev };
            selectedIds.forEach(id => delete next[id]);
            return next;
          });
          setSelectedIds([]);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault(); // Prevent bookmark
        if (selectedIds.length > 0) {
          setLocalItems(prev => {
            const next = { ...prev };
            const newIds: string[] = [];
            selectedIds.forEach(id => {
              const item = prev[id];
              if (item) {
                const newId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                next[newId] = {
                  ...item,
                  id: newId,
                  x: item.x + 40,
                  y: item.y + 40
                };
                newIds.push(newId);
              }
            });
            setSelectedIds(newIds);
            return next;
          });
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setSelectedIds(Object.keys(localItems));
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "g") {
        e.preventDefault();
        console.log("Group items:", selectedIds);
      } else if (e.key === "Escape") {
        setSelectedIds([]);
      }
    };
    
    window.addEventListener("keydown", handleActionKeys);
    return () => window.removeEventListener("keydown", handleActionKeys);
  }, [selectedIds, localItems]);

  // Wheel handling for zoom & pan
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setCamera((prev) => {
        if (e.ctrlKey || e.metaKey) {
          // Zoom
          const zoomSensitivity = 0.005;
          const delta = -e.deltaY * zoomSensitivity;
          const newZ = Math.min(Math.max(0.1, prev.z * (1 + delta)), 5);

          // Zoom towards cursor
          const rect = container.getBoundingClientRect();
          const cursorX = e.clientX - rect.left;
          const cursorY = e.clientY - rect.top;

          const newX = cursorX - (cursorX - prev.x) * (newZ / prev.z);
          const newY = cursorY - (cursorY - prev.y) * (newZ / prev.z);

          return { x: newX, y: newY, z: newZ };
        } else {
          // Pan
          return {
            x: prev.x - e.deltaX,
            y: prev.y - e.deltaY,
            z: prev.z,
          };
        }
      });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Middle click, space + click, or left-click on the background directly
    const target = e.target as HTMLElement;
    const isBackgroundClick =
      e.button === 0 &&
      (target.classList.contains("canvas") ||
        target.classList.contains("canvas-inner") ||
        target.classList.contains("connectors") ||
        target.tagName.toLowerCase() === "svg");

    if (e.button === 1 || isSpacePressed) {
      setIsPanning(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    } else if (isBackgroundClick) {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;
        const cursorCanvasX = (cursorX - camera.x) / camera.z;
        const cursorCanvasY = (cursorY - camera.y) / camera.z;

        setSelectionBox({
          startX: cursorCanvasX,
          startY: cursorCanvasY,
          currentX: cursorCanvasX,
          currentY: cursorCanvasY,
        });

        if (!e.shiftKey) {
          setSelectedIds([]);
        }
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    }
  };

  const handleItemPointerDown = (e: React.PointerEvent, itemId: string) => {
    // Left-click to drag
    if (e.button === 0 && !isSpacePressed) {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);

      // Handle selection
      let newSelectedIds = [...selectedIds];
      if (e.shiftKey) {
        if (newSelectedIds.includes(itemId)) {
          newSelectedIds = newSelectedIds.filter(id => id !== itemId);
        } else {
          newSelectedIds.push(itemId);
        }
      } else {
        if (!newSelectedIds.includes(itemId)) {
          newSelectedIds = [itemId];
        }
      }
      setSelectedIds(newSelectedIds);

      // Setup drag
      if (containerRef.current) {
        setDraggingItemId(itemId);

        const rect = containerRef.current.getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;
        const cursorCanvasX = (cursorX - camera.x) / camera.z;
        const cursorCanvasY = (cursorY - camera.y) / camera.z;

        setDragStartCursor({ x: cursorCanvasX, y: cursorCanvasY });

        const initialItems: Record<string, { x: number, y: number }> = {};
        newSelectedIds.forEach((id) => {
          if (localItems[id]) {
            initialItems[id] = { x: localItems[id].x, y: localItems[id].y };
          }
        });
        if (localItems[itemId] && !initialItems[itemId]) {
          initialItems[itemId] = { x: localItems[itemId].x, y: localItems[itemId].y };
        }
        setDragStartItems(initialItems);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setCamera((prev) => ({
        ...prev,
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
    } else if (selectionBox && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;
      const cursorCanvasX = (cursorX - camera.x) / camera.z;
      const cursorCanvasY = (cursorY - camera.y) / camera.z;
      
      setSelectionBox(prev => prev ? { ...prev, currentX: cursorCanvasX, currentY: cursorCanvasY } : null);
    } else if (draggingItemId && containerRef.current && dragStartCursor) {
      const rect = containerRef.current.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      const cursorCanvasX = (cursorX - camera.x) / camera.z;
      const cursorCanvasY = (cursorY - camera.y) / camera.z;
      
      const dx = cursorCanvasX - dragStartCursor.x;
      const dy = cursorCanvasY - dragStartCursor.y;

      setLocalItems((prev) => {
        const next = { ...prev };
        Object.keys(dragStartItems).forEach(id => {
          if (next[id]) {
            next[id] = {
              ...next[id],
              x: dragStartItems[id].x + dx,
              y: dragStartItems[id].y + dy,
            };
          }
        });
        return next;
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (selectionBox) {
      const minX = Math.min(selectionBox.startX, selectionBox.currentX);
      const maxX = Math.max(selectionBox.startX, selectionBox.currentX);
      const minY = Math.min(selectionBox.startY, selectionBox.currentY);
      const maxY = Math.max(selectionBox.startY, selectionBox.currentY);

      const newlySelected = new Set(e.shiftKey ? selectedIds : []);
      Object.entries(localItems).forEach(([id, item]) => {
        const itemW = 280;
        const itemH = 150;
        const centerX = item.x + itemW / 2;
        const centerY = item.y + itemH / 2;

        if (
          centerX >= minX &&
          centerX <= maxX &&
          centerY >= minY &&
          centerY <= maxY
        ) {
          newlySelected.add(id);
        }
      });
      setSelectedIds(Array.from(newlySelected));
      setSelectionBox(null);
    }
    if (draggingItemId) {
      setDraggingItemId(null);
      setDragStartCursor(null);
      setDragStartItems({});
    }
    
    if (e.target instanceof Element && e.target.hasPointerCapture(e.pointerId)) {
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  const items = localItems || {};
  const currentConnectors = workspaceData?.canvas?.connectors || [];

  return (
    <section
      className={`canvas ${isSpacePressed ? "cursor-grab" : ""} ${isPanning ? "cursor-grabbing" : ""}`}
      tabIndex={0}
      aria-label="Project evidence canvas"
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={(e) => isSpacePressed && e.preventDefault()}
      style={{ 
        overflow: "hidden",
        background: `
          radial-gradient(circle at 30% 20%, rgba(76, 131, 216, 0.07), transparent 28%),
          radial-gradient(circle at 70% 50%, rgba(127, 94, 219, 0.07), transparent 30%),
          radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)
        `,
        backgroundSize: `
          auto, auto, ${24 * camera.z}px ${24 * camera.z}px
        `,
        backgroundPosition: `
          0 0, 0 0, ${camera.x}px ${camera.y}px
        `,
        backgroundColor: "var(--bg-2)"
      }}
    >
      <div
        className="canvas-inner"
        style={{
          transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.z})`,
          transformOrigin: "0 0",
          position: "absolute",
          top: 0,
          left: 0,
          willChange: "transform",
        }}
      >
        <svg
          className="connectors"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            overflow: "visible",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          {currentConnectors.map((c: any) => {
            const fromItem = items[c.fromItemId];
            const toItem = items[c.toItemId];
            if (!fromItem || !toItem) return null;

            const p1 = getPoint(fromItem, c.fromEdge, c.fromOffset);
            const p2 = getPoint(toItem, c.toEdge, c.toOffset);
            const pathData = getPath(p1, p2, c.fromEdge, c.toEdge);
            const isHovered = hoveredConnector === c.id;

            return (
              <g
                key={c.id}
                className={`connector-group ${isHovered ? "hovered" : ""}`}
                onMouseEnter={() => setHoveredConnector(c.id)}
                onMouseLeave={() => setHoveredConnector(null)}
                style={{ pointerEvents: "all" }}
              >
                <title>
                  {`${fromItem.id} → ${toItem.id}\n${c.explanation}\nState: ${c.state}\nLast updated: ${c.lastUpdated}`}
                </title>
                <path
                  d={pathData}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="20"
                  className="hover-track"
                />
                <path
                  className={`connector state-${c.state} ${isHovered ? "is-hovered" : ""}`}
                  d={pathData}
                />
                <circle
                  className={`node state-${c.state}`}
                  cx={p1.x}
                  cy={p1.y}
                  r={isHovered ? 6 : 4}
                />
                <circle
                  className={`node state-${c.state}`}
                  cx={p2.x}
                  cy={p2.y}
                  r={isHovered ? 6 : 4}
                />
              </g>
            );
          })}
        </svg>

        {selectionBox && (
          <div
            style={{
              position: "absolute",
              left: Math.min(selectionBox.startX, selectionBox.currentX),
              top: Math.min(selectionBox.startY, selectionBox.currentY),
              width: Math.abs(selectionBox.currentX - selectionBox.startX),
              height: Math.abs(selectionBox.currentY - selectionBox.startY),
              backgroundColor: "rgba(196, 154, 85, 0.1)",
              border: "1px solid rgba(196, 154, 85, 0.5)",
              pointerEvents: "none",
              zIndex: 100,
            }}
          />
        )}

        {Object.values(items).map((item: any) => {
          const isSelected = selectedIds.includes(item.id);
          const isDragging = draggingItemId === item.id || (draggingItemId && selectedIds.includes(draggingItemId) && isSelected);

          const style = {
            position: "absolute",
            top: item.y,
            left: item.x,
            width: item.w,
            height: item.h,
            zIndex: isDragging ? 20 : (isSelected ? 5 : 1),
          } as React.CSSProperties;
          
          const PinIcon =
            item.type === "notes" ||
            item.type === "similar" ||
            item.type === "stakeholders" ||
            item.type === "sheet"
              ? PinOff
              : Pin;
          const pinClass = PinIcon === Pin ? "is-locked" : "is-open";
          const baseCardClass = item.type === 'timeline' ? 'timeline-card' : item.type;
          const cardClassName = `card ${baseCardClass} ${isSelected ? 'is-selected' : ''} ${isDragging ? 'is-dragging' : ''}`;

          if (item.type === "overview") {
            const isDragging = draggingItemId === item.id || (draggingItemId && selectedIds.includes(draggingItemId) && isSelected);
            const updatedStyle = {
              ...style,
              cursor: isDragging ? "grabbing" : "grab",
              zIndex: isDragging ? 10 : style.zIndex,
            };
            return (
              <article
                key={item.id}
                className={cardClassName}
                style={updatedStyle}
                onPointerDown={(e) => handleItemPointerDown(e, item.id)}
              >
                <button
                  className="pin is-locked"
                  aria-label="Unlock pinned project overview"
                  title="Unpin"
                >
                  <Pin size={14} />
                </button>
                <div className="card-title">Project Overview</div>
                <div className="fileline">
                  <div className="file-icon">
                    <BarChart3 size={16} />
                  </div>
                  <div>
                    <div className="strong small">
                      {workspaceData?.documents?.[0]?.fileName ||
                        "Executive Summary"}
                    </div>
                    <div className="tiny muted">
                      {workspaceData?.name || "Workspace"}
                    </div>
                  </div>
                </div>
                <div className="divider"></div>
                {activeWorkspaceId === "harbour-tower" ? (
                  <div className="stack tiny">
                    <div>
                      <span className="muted">Purpose</span>
                      <br />
                      <span className="strong">
                        Additional 14 floors / mixed use
                      </span>
                    </div>
                    <div>
                      <span className="muted">Value</span>
                      <br />
                      <span className="strong">$38.6M estimated uplift</span>
                    </div>
                    <div className="row muted">
                      <span>Updated 2h ago</span>
                      <span
                        className="avatar"
                        style={{
                          width: "24px",
                          height: "24px",
                          fontSize: "10px",
                        }}
                      >
                        AH
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="stack tiny">
                    <div>
                      <span className="muted">Records loaded</span>
                      <br />
                      <span className="strong">
                        {workspaceData?.documents?.length || 0} Evidences
                      </span>
                    </div>
                  </div>
                )}
                <SystemFooter
                  system="Salesforce CRM"
                  status="synced"
                  time="Synced 2h ago"
                  category="Project Strategy"
                  dbEntity="workspace.documents[0]"
                />
              </article>
            );
          }

          if (item.type === "document") {
            const doc =
              workspaceData?.documents?.find(
                (d: any) => d.id === item.dataId,
              ) || workspaceData?.documents?.[1];
            if (!doc) return null;
            const isDragging = draggingItemId === item.id || (draggingItemId && selectedIds.includes(draggingItemId) && isSelected);
            const updatedStyle = {
              ...style,
              cursor: isDragging ? "grabbing" : "grab",
              zIndex: isDragging ? 10 : style.zIndex,
            };
            return (
              <article
                key={item.id}
                className={cardClassName}
                style={updatedStyle}
                onPointerDown={(e) => handleItemPointerDown(e, item.id)}
              >
                <button
                  className="pin is-locked"
                  aria-label="Unlock pinned document"
                  title="Unpin"
                >
                  <Pin size={14} />
                </button>
                <div className="card-title">Key Document</div>
                <div className="fileline">
                  <div
                    className={`file-icon ${doc.fileType === "PDF" ? "pdf" : ""}`}
                  >
                    <FileText size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="strong small">
                      {doc.fileName || "Document"}
                    </div>
                    <div className="tiny muted">
                      {doc.sizeMB || "Unknown"} MB
                    </div>
                  </div>
                  <button
                    className="button-icon"
                    title="View Document"
                    style={{
                      padding: "4px",
                      background: "transparent",
                      border: "none",
                      color: "var(--muted)",
                      cursor: "pointer",
                    }}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="button-icon"
                    title="Download"
                    style={{
                      padding: "4px",
                      background: "transparent",
                      border: "none",
                      color: "var(--muted)",
                      cursor: "pointer",
                    }}
                  >
                    <Download size={16} />
                  </button>
                </div>
                <div style={{ marginTop: "8px", display: "flex", gap: "4px" }}>
                  <span className="tag">{doc.tags?.[0] || "Tag"}</span>
                </div>
                <SystemFooter
                  system="Aconex CDE"
                  status="synced"
                  time="Synced 5m ago"
                  category="Reference Material"
                  dbEntity="workspace.documents[docId]"
                />
              </article>
            );
          }

          if (item.type === "site") {
            const isDragging = draggingItemId === item.id || (draggingItemId && selectedIds.includes(draggingItemId) && isSelected);
            const updatedStyle = {
              ...style,
              cursor: isDragging ? "grabbing" : "grab",
              zIndex: isDragging ? 10 : style.zIndex,
            };
            return (
              <article
                key={item.id}
                className={cardClassName}
                style={updatedStyle}
                onPointerDown={(e) => handleItemPointerDown(e, item.id)}
              >
                <button
                  className="pin is-locked"
                  aria-label="Unlock pinned site image"
                  title="Unpin"
                >
                  <Pin size={14} />
                </button>
                <div className="card-title">Site Image</div>
                <div className="image-thumb"></div>
                <div className="row tiny muted">
                  <span>Added 3d ago</span>
                  <span>
                    <MoreHorizontal size={14} />
                  </span>
                </div>
                <SystemFooter
                  system="DroneDeploy"
                  status="synced"
                  time="Synced 3d ago"
                  category="Visual Evidence"
                  dbEntity="assets/site_capture"
                />
              </article>
            );
          }

          if (item.type === "sheet") {
            const doc =
              workspaceData?.documents?.find(
                (d: any) => d.id === item.dataId,
              ) ||
              workspaceData?.documents?.find?.(
                (d: any) => d.fileType === "XLSX",
              );
            const isDragging = draggingItemId === item.id || (draggingItemId && selectedIds.includes(draggingItemId) && isSelected);
            const updatedStyle = {
              ...style,
              cursor: isDragging ? "grabbing" : "grab",
              zIndex: isDragging ? 10 : style.zIndex,
            };
            return (
              <article
                key={item.id}
                className={cardClassName}
                style={updatedStyle}
                onPointerDown={(e) => handleItemPointerDown(e, item.id)}
              >
                <button
                  className={`pin ${pinClass}`}
                  aria-label="Toggle pin"
                  title="Pin"
                >
                  <PinIcon size={14} />
                </button>
                <div className="card-title">Model Data</div>
                <div className="fileline">
                  <div className="file-icon sheet">▦</div>
                  <div style={{ flex: 1 }}>
                    <div className="strong small">
                      {doc?.fileName || "Model.xlsx"}
                    </div>
                    <div className="tiny muted">Added recently</div>
                  </div>
                  <button
                    className="button-icon"
                    title="View Source"
                    style={{
                      padding: "4px",
                      background: "transparent",
                      border: "none",
                      color: "var(--muted)",
                      cursor: "pointer",
                    }}
                  >
                    <Link2 size={16} />
                  </button>
                </div>
                <div style={{ marginTop: "8px" }}>
                  <span className="tag">Financial</span>
                </div>
                <SystemFooter
                  system="Anaplan"
                  status="syncing"
                  category="Financial Model"
                  dbEntity="workspace.documents[xlsx]"
                />
              </article>
            );
          }

          if (item.type === "decision" && workspaceData?.decisions) {
            const isDragging = draggingItemId === item.id || (draggingItemId && selectedIds.includes(draggingItemId) && isSelected);
            const updatedStyle = {
              ...style,
              cursor: isDragging ? "grabbing" : "grab",
              zIndex: isDragging ? 10 : style.zIndex,
            };
            return (
              <article
                key={item.id}
                className={cardClassName}
                style={updatedStyle}
                onPointerDown={(e) => handleItemPointerDown(e, item.id)}
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  try {
                    const data = JSON.parse(e.dataTransfer.getData("application/json"));
                    // We simply add it to the state if you want, but for now just logging or maybe opening a toast
                    console.log("Dropped on decision card: ", data);
                  } catch (err) {}
                }}
              >
                <button
                  className="pin is-locked"
                  aria-label="Unlock pinned decision log"
                >
                  <Pin size={14} />
                </button>
                <div className="card-title">Decision Log</div>
                <table style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Decision</th>
                      <th>Date</th>
                      <th>Decided by</th>
                      <th>Rationale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workspaceData.decisions.map((d: any) => (
                      <tr key={d.id} style={{ alignContent: "flex-start" }}>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <CheckCircle2 size={12} color="var(--brass)" />{" "}
                            {d.decisionSummary}
                          </div>
                        </td>
                        <td className="muted">{d.dateDecided}</td>
                        <td>{d.decidedBy}</td>
                        <td className="muted">{d.rationale}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                  }}
                >
                  <button
                    className="button"
                    style={{
                      fontSize: "12px",
                      padding: "4px 8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "transparent",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <Plus size={12} /> Add Decision
                  </button>
                  <button
                    className="button primary"
                    onClick={() => setIsEvidenceModalOpen(true)}
                    style={{
                      fontSize: "12px",
                      padding: "4px 8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Link2 size={12} /> Link Evidence
                  </button>
                </div>
                <SystemFooter
                  system="Jira Software"
                  status="synced"
                  time="Synced 1h ago"
                  category="Governance"
                  dbEntity="workspace.decisions[*]"
                />
              </article>
            );
          }

          if (item.type === "risk" && workspaceData?.risks) {
            const isDragging = draggingItemId === item.id || (draggingItemId && selectedIds.includes(draggingItemId) && isSelected);
            const updatedStyle = {
              ...style,
              cursor: isDragging ? "grabbing" : "grab",
              zIndex: isDragging ? 10 : style.zIndex,
            };
            return (
              <article
                key={item.id}
                className={cardClassName}
                style={updatedStyle}
                onPointerDown={(e) => handleItemPointerDown(e, item.id)}
              >
                <button
                  className="pin is-locked"
                  aria-label="Unlock pinned risk register"
                >
                  <Pin size={14} />
                </button>
                <div
                  className="card-title"
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <AlertTriangle size={14} color="#f87171" /> Risk Register
                </div>
                <table style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Risk</th>
                      <th>Impact</th>
                      <th>Likelihood</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workspaceData.risks.map((r: any) => {
                      const isHigh = r.impact === "High" || r.riskScore > 14;
                      return (
                        <tr key={r.id}>
                          <td>{r.riskTitle}</td>
                          <td>
                            <span
                              style={{
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontSize: "10px",
                                background: isHigh
                                  ? "rgba(248, 113, 113, 0.15)"
                                  : "rgba(255, 255, 255, 0.05)",
                                color: isHigh ? "#fca5a5" : "var(--muted)",
                              }}
                            >
                              {r.impact}
                            </span>
                          </td>
                          <td className="muted">{r.likelihood}</td>
                          <td>
                            <span
                              style={{
                                fontWeight: isHigh ? 600 : 400,
                                color: isHigh ? "#fca5a5" : "inherit",
                              }}
                            >
                              {r.riskScore}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <SystemFooter
                  system="Riskonnect GRC"
                  status="synced"
                  time="Synced 2h ago"
                  category="Risk Management"
                  dbEntity="workspace.risks[*]"
                />
              </article>
            );
          }

          if (item.type === "similar") {
            const isDragging = draggingItemId === item.id || (draggingItemId && selectedIds.includes(draggingItemId) && isSelected);
            const updatedStyle = {
              ...style,
              cursor: isDragging ? "grabbing" : "grab",
              zIndex: isDragging ? 10 : style.zIndex,
            };
            return (
              <article
                key={item.id}
                className={cardClassName}
                style={updatedStyle}
                onPointerDown={(e) => handleItemPointerDown(e, item.id)}
              >
                <button
                  className={`pin ${pinClass}`}
                  aria-label="Toggle pin"
                  title="Pin"
                >
                  <PinIcon size={14} />
                </button>
                <div className="card-title">Similar Projects</div>
                <div
                  className="similar-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <div className="mini-img"></div>
                  <div style={{ flex: 1 }}>
                    <div className="strong tiny">Riverside Plaza</div>
                    <div className="muted tiny">
                      88% match based on parameters
                    </div>
                  </div>
                  <button
                    className="button-icon"
                    style={{
                      background: "none",
                      border: "none",
                      padding: "4px",
                      color: "var(--brass)",
                    }}
                  >
                    <Eye size={14} />
                  </button>
                </div>
                <div
                  className="similar-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <div className="mini-img"></div>
                  <div style={{ flex: 1 }}>
                    <div className="strong tiny">Harbour West Precinct</div>
                    <div className="muted tiny">
                      76% match based on location
                    </div>
                  </div>
                  <button
                    className="button-icon"
                    style={{
                      background: "none",
                      border: "none",
                      padding: "4px",
                      color: "var(--brass)",
                    }}
                  >
                    <Eye size={14} />
                  </button>
                </div>
                <SystemFooter
                  system="Knowledge Graph"
                  status="local"
                  time="AI Generated"
                  category="ML Context"
                  dbEntity="similar_projects_index"
                />
              </article>
            );
          }

          if (item.type === "timeline" && workspaceData?.timeline) {
            const isDragging = draggingItemId === item.id || (draggingItemId && selectedIds.includes(draggingItemId) && isSelected);
            const updatedStyle = {
              ...style,
              cursor: isDragging ? "grabbing" : "grab",
              zIndex: isDragging ? 10 : style.zIndex,
            };
            return (
              <article
                key={item.id}
                className={cardClassName}
                style={updatedStyle}
                onPointerDown={(e) => handleItemPointerDown(e, item.id)}
              >
                <button
                  className="pin is-locked"
                  aria-label="Unlock pinned project timeline"
                >
                  <Pin size={14} />
                </button>
                <div
                  className="card-title"
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Clock size={14} /> Project Timeline
                </div>
                <div className="timeline">
                  <div className="milestones">
                    {workspaceData.timeline.map((t: any) => (
                      <div
                        key={t.id}
                        className={`mile ${t.status === "active" ? "active" : ""}`}
                      >
                        {t.phaseName}
                        <span></span>
                        {t.targetDate.split(" ")[0]}
                      </div>
                    ))}
                  </div>
                </div>
                <SystemFooter
                  system="Oracle Primavera P6"
                  status="syncing"
                  category="Planning"
                  dbEntity="workspace.timeline[*]"
                />
              </article>
            );
          }

          if (item.type === "stakeholders" && workspaceData?.stakeholders) {
            const isDragging = draggingItemId === item.id || (draggingItemId && selectedIds.includes(draggingItemId) && isSelected);
            const updatedStyle = {
              ...style,
              cursor: isDragging ? "grabbing" : "grab",
              zIndex: isDragging ? 10 : style.zIndex,
            };
            return (
              <article
                key={item.id}
                className={cardClassName}
                style={updatedStyle}
                onPointerDown={(e) => handleItemPointerDown(e, item.id)}
              >
                <button
                  className={`pin ${pinClass}`}
                  aria-label="Toggle pin"
                  title="Pin"
                >
                  <PinIcon size={14} />
                </button>
                <div
                  className="card-title"
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Users size={14} /> Stakeholders
                </div>
                <div className="people">
                  {workspaceData.stakeholders.map((s: any) => (
                    <div
                      className="person"
                      key={s.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      <div className="circle">{s.initials}</div>
                      <div style={{ flex: 1 }}>
                        <div className="strong tiny">{s.fullName}</div>
                        <div className="muted tiny">{s.role}</div>
                      </div>
                      <button
                        className="button-icon"
                        title="Send Message"
                        style={{
                          padding: "4px",
                          background: "transparent",
                          border: "none",
                          color: "var(--muted)",
                        }}
                      >
                        <MessageSquare size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <SystemFooter
                  system="Workday HRIS"
                  status="synced"
                  time="Synced yesterday"
                  category="Oversight"
                  dbEntity="workspace.stakeholders[*]"
                />
              </article>
            );
          }

          if (item.type === "notes") {
            const isDragging = draggingItemId === item.id || (draggingItemId && selectedIds.includes(draggingItemId) && isSelected);
            const updatedStyle = {
              ...style,
              cursor: isDragging ? "grabbing" : "grab",
              zIndex: isDragging ? 10 : style.zIndex,
              display: "flex",
              flexDirection: "column" as const,
            };
            return (
              <article
                key={item.id}
                className={cardClassName}
                style={updatedStyle}
                onPointerDown={(e) => handleItemPointerDown(e, item.id)}
              >
                <button
                  className={`pin ${pinClass}`}
                  aria-label="Toggle pin"
                  title="Pin"
                >
                  <PinIcon size={14} />
                </button>
                <div className="card-title">Notes</div>
                <textarea
                  className="note-box"
                  style={{
                    flex: 1,
                    resize: "none",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--line)",
                    borderRadius: "4px",
                    padding: "8px",
                    color: "inherit",
                    fontFamily: "inherit",
                    fontSize: "12px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  defaultValue="Ensure the integration uses direct gemini-1.5-pro for diagnosis, without Lobster Trap rerouting."
                  onPointerDown={(e) => e.stopPropagation()} // Stop drag when clicking inside textarea
                />
                <div
                  className="tiny muted"
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>
                    Angela Agent
                    <br />
                    Today
                  </span>
                  <button
                    className="button"
                    style={{ padding: "4px 8px", fontSize: "10px" }}
                  >
                    Save
                  </button>
                </div>
                <SystemFooter
                  system="Local Note"
                  status="local"
                  category="Canvas State"
                  dbEntity="local_storage"
                />
              </article>
            );
          }

          return null;
        })}
      </div>

      <div
        className="context-menu"
        role="menu"
        aria-label="Canvas contextual add menu"
      >
        <button className="context-menu-btn" role="menuitem">
          ▤ Add note
        </button>
        <button className="context-menu-btn" role="menuitem">
          ⇧ Upload document
        </button>
        <button className="context-menu-btn" role="menuitem">
          ▧ Add image
        </button>
        <button className="context-menu-btn" role="menuitem">
          ▦ Add spreadsheet
        </button>
        <button className="context-menu-btn" role="menuitem">
          ▦ Add from sources
        </button>
      </div>

      {isEvidenceModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius)",
              width: "400px",
              padding: "24px",
              boxShadow: "var(--shadow)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontFamily: '"Playfair Display", serif',
                }}
              >
                Link Evidence to Decision
              </h3>
              <button
                onClick={() => setIsEvidenceModalOpen(false)}
                style={{
                  fontSize: "20px",
                  color: "var(--muted)",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "var(--muted)",
                marginBottom: "16px",
                marginTop: 0,
              }}
            >
              Select an existing source or drag it into the drop zone to back up this decision log entry.
            </p>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOverDropZone(true); }}
              onDragLeave={() => setIsDragOverDropZone(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOverDropZone(false);
                if (draggedEvidenceDoc && !linkedEvidenceDocs.find(d => d.id === draggedEvidenceDoc.id)) {
                  setLinkedEvidenceDocs([...linkedEvidenceDocs, draggedEvidenceDoc]);
                }
              }}
              className="card decision"
              style={{
                position: "relative",
                width: "100%",
                height: "auto",
                minHeight: "150px",
                marginBottom: "24px",
                cursor: "default",
                border: isDragOverDropZone ? '2px dashed var(--brass)' : '1px solid var(--line)',
                background: isDragOverDropZone ? 'rgba(196,154,85,0.05)' : 'var(--card)',
                boxShadow: isDragOverDropZone ? '0 0 15px rgba(196,154,85,0.2)' : 'var(--shadow)',
                transform: isDragOverDropZone ? 'scale(1.02)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Target Decision</span>
                <span style={{ 
                  background: "var(--active)", 
                  color: "white", 
                  padding: "2px 8px", 
                  borderRadius: "12px", 
                  fontSize: "10px", 
                  fontWeight: "bold", 
                  textTransform: "uppercase" 
                }}>New</span>
              </div>
              <div style={{ padding: "12px" }}>
                <p style={{ fontSize: "14px", fontWeight: "500", margin: "0 0 12px 0" }}>
                  Decision: Reallocate engineering resources to address APAC logistics delay.
                </p>
                {linkedEvidenceDocs.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Linked Evidence</div>
                    {linkedEvidenceDocs.map(d => (
                      <div key={d.id} style={{ 
                        fontSize: "12px", 
                        background: "var(--panel)", 
                        padding: "8px 12px", 
                        borderRadius: "4px", 
                        border: "1px solid var(--line)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        <Link2 size={14} style={{ color: "var(--brass)" }} />
                        {d.fileName}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ 
                    padding: "24px", 
                    textAlign: "center", 
                    border: "1px dashed var(--line)", 
                    borderRadius: "6px",
                    color: "var(--muted)", 
                    fontSize: "13px",
                    marginTop: "12px"
                  }}>
                    Drag evidence here to link to this decision
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {workspaceData?.documents?.map((doc: any) => (
                <label
                  key={doc.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedEvidenceDoc(doc);
                    e.dataTransfer.setData("application/json", JSON.stringify(doc));
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  onDragEnd={() => setDraggedEvidenceDoc(null)}
                  style={{
                    padding: "12px",
                    border: "1px solid var(--line)",
                    borderRadius: "6px",
                    cursor: "grab",
                    background: "var(--card)",
                    display: "flex",
                    alignItems: "start",
                    gap: "12px",
                    opacity: draggedEvidenceDoc?.id === doc.id ? 0.5 : 1,
                  }}
                >
                  <input 
                    type="checkbox" 
                    style={{ marginTop: "4px" }} 
                    checked={linkedEvidenceDocs.some(d => d.id === doc.id)}
                    onChange={(e) => {
                      if (e.target.checked) setLinkedEvidenceDocs([...linkedEvidenceDocs, doc]);
                      else setLinkedEvidenceDocs(linkedEvidenceDocs.filter(d => d.id !== doc.id));
                    }}
                  />
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600 }}>
                      {doc.fileName || "Document"}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                      {doc.tags?.[0] || "Evidence"} •{" "}
                      {doc.sizeMB ? `${doc.sizeMB} MB` : "Unknown size"}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div
              style={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <button
                onClick={() => setIsEvidenceModalOpen(false)}
                style={{ padding: "6px 12px", color: "var(--text)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => setIsEvidenceModalOpen(false)}
                className="button primary"
              >
                Link Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
