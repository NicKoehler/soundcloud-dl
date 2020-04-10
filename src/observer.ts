export interface ObserverEvent {
  selector: string;
  callback: (node: any) => void;
}

export class Observer {
  private observer: MutationObserver;
  private events: ObserverEvent[] = [];
  private unqiueNodeId: number = 0;

  constructor() {
    this.observer = new MutationObserver((mutations) => mutations.forEach((mutation) => this.handleMutation(mutation)));
  }

  start(node: Node) {
    this.observer.observe(node, { subtree: true, attributes: true, childList: true });
  }

  stop() {
    this.observer.disconnect();
  }

  addEvent(event: ObserverEvent) {
    this.events.push(event);
  }

  private handleMutation(mutation: MutationRecord) {
    const target = mutation.target;
    const newNodes = mutation.addedNodes ?? [];

    for (const event of this.events) {
      if (newNodes.length > 0) {
        this.handleNodes(newNodes, event);
      } else if (mutation.type === "attributes") {
        this.handleNodes([target], event, false);
      }
    }
  }

  private handleNodes(nodes: any[] | NodeList, event: ObserverEvent, recursive: boolean = true) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if (this.matchesSelectors(node, event.selector)) {
        // We only want to emmit an event once
        if (node._id !== undefined) return;

        node._id = ++this.unqiueNodeId;
        event.callback(node);
      }

      if (recursive && node.childNodes?.length > 0) this.handleNodes(node.childNodes, event);
    }
  }

  private matchesSelectors(element: any, selectors: string) {
    return element instanceof HTMLElement && element.matches(selectors);
  }
}
